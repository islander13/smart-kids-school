// ─────────────────────────────────────────────────────────────────────────
// Netlify Function : create-checkout-session
// ─────────────────────────────────────────────────────────────────────────
// Crée une session Stripe Checkout en CHF STRICT (sans Adaptive Pricing)
// Reçoit les données du formulaire React et retourne l'URL Checkout
// ─────────────────────────────────────────────────────────────────────────
//
// PRICING OPTION A — engagement minimum 3 mois (plus de "Sans engagement")
//
//   PAIEMENT MENSUEL (abonnement récurrent) :
//     solo-m3  → 299/mois    solo-m6  → 269/mois    solo-m12  → 249/mois
//     duo-m3   → 398/mois    duo-m6   → 358/mois    duo-m12   → 338/mois
//
//   PAIEMENT EN UNE FOIS (paiement unique, ~10% de rabais, prix finissant par 9) :
//     solo-m3-once  →  799   (vs 897,  −10.9%)
//     solo-m6-once  → 1449   (vs 1614, −10.2%)
//     solo-m12-once → 2689   (vs 2988, −10.0%)
//     duo-m3-once   → 1079   (vs 1194, −9.6%)
//     duo-m6-once   → 1929   (vs 2148, −10.2%)
//     duo-m12-once  → 3649   (vs 4056, −10.0%)
//
//   ⚠️ Les clés DOIVENT correspondre exactement aux productKey envoyés par
//      tarifs.tsx : `${format}-${engagement}` (mensuel) ou
//      `${format}-${engagement}-once` (paiement unique).
// ─────────────────────────────────────────────────────────────────────────

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { getDatabase } = require('@netlify/database');
const { isRateLimited } = require('./lib/rateLimit');
const { sendErrorAlert } = require('./lib/alertOnError');
const { PRODUCTS, sourceFromProductKey } = require('./lib/checkoutCatalog');

// ─── CORS (autorise votre site à appeler la function) ───
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async (event) => {
  // Préflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  // N'accepter que les POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  if (isRateLimited(event)) {
    return {
      statusCode: 429,
      headers: { ...corsHeaders, 'Retry-After': '60' },
      body: JSON.stringify({ error: 'too_many_requests' }),
    };
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  try {
    const { productKey, customerEmail, metadata, locale } = data;
    // La page de paiement Stripe doit parler la langue que le client a
    // utilisée sur tout le reste du site (FR/EN/DE) — pas systématiquement
    // le français. On ne fait confiance qu'aux 3 valeurs qu'on sert nous-mêmes.
    const stripeLocale = ['fr', 'en', 'de'].includes(locale) ? locale : 'fr';

    // Validation
    if (!productKey || !PRODUCTS[productKey]) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid product key' }),
      };
    }
    if (!customerEmail || !customerEmail.includes('@')) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid email' }),
      };
    }

    const product = PRODUCTS[productKey];

    // ─── Construction des line_items en CHF strict ───
    const lineItems = [{
      price_data: {
        currency: 'chf',  // ⚠️ CHF FORCÉ — pas de conversion
        product_data: {
          name: product.name,
          description: product.description,
        },
        unit_amount: product.price * 100,  // Stripe attend les centimes
        ...(product.recurring && { recurring: { interval: 'month' } }),
      },
      quantity: 1,
    }];

    // ─── Création de la session Checkout (mode "embedded") ───
    // Le formulaire de paiement s'affiche directement dans la page (dans la
    // modal), au lieu de rediriger vers une page Stripe séparée. Toujours
    // géré et sécurisé par Stripe — seule la présentation change.
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: product.recurring ? 'subscription' : 'payment',
      line_items: lineItems,
      currency: 'chf',  // ⚠️ Force CHF au niveau session aussi
      customer_email: customerEmail,
      // ⚠️ DÉSACTIVE Adaptive Pricing — c'est la clé du succès
      adaptive_pricing: { enabled: false },
      // Méthodes de paiement
      payment_method_types: ['card'],
      // En mode embedded, une seule URL de retour (après paiement réussi) ;
      // il n'y a plus de "cancel_url" séparée puisque le client ne quitte
      // jamais le site pour annuler — il ferme simplement la modal.
      // value/product_key : connus ici (source de vérité des prix), transmis
      // en clair dans l'URL pour que /merci puisse envoyer un événement
      // Purchase avec le bon montant (Meta ne peut pas optimiser sur la
      // valeur d'achat sans ça). Seul {CHECKOUT_SESSION_ID} est un template
      // rempli par Stripe lui-même après paiement réussi.
      return_url: `${process.env.SITE_URL || 'https://smartkids-school.ch'}/merci?session_id={CHECKOUT_SESSION_ID}&value=${product.price}&product_key=${encodeURIComponent(productKey)}`,
      // Métadonnées (utiles pour suivi côté Stripe)
      metadata: {
        productKey: productKey,
        ...metadata,  // parent name, child names, age, etc.
      },
      // Langue de la page de paiement Stripe elle-même (distincte de la
      // devise CHF, forcée plus haut quelle que soit la langue).
      locale: stripeLocale,
      // Permettre les codes promo
      allow_promotion_codes: true,
      // Collecte de la facturation
      billing_address_collection: 'auto',
    });

    // ─── Enregistrement en base (best-effort) ───
    // Une erreur ici ne doit jamais empêcher le client de payer : le
    // paiement reste la priorité, la trace en base est un complément.
    try {
      // En "Lambda compatibility mode" (exports.handler), Netlify n'injecte
      // pas automatiquement la chaîne de connexion : on la passe nous-mêmes.
      // https://docs.netlify.com/build/data-and-storage/netlify-database/troubleshooting/#environment-not-configured
      const { sql } = getDatabase({ connectionString: process.env.NETLIFY_DB_URL });
      await sql`
        INSERT INTO enrollments (
          source, status, parent_name, email, phone,
          product_key, plan_label, stripe_session_id, details
        ) VALUES (
          ${sourceFromProductKey(productKey)}, 'form_submitted',
          ${metadata?.parentName || null}, ${customerEmail}, ${metadata?.phone || null},
          ${productKey}, ${product.name}, ${session.id}, ${JSON.stringify(metadata || {})}
        )
      `;
    } catch (dbError) {
      console.error('Enregistrement base de données échoué (non bloquant):', dbError.message);
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ clientSecret: session.client_secret, sessionId: session.id }),
    };
  } catch (error) {
    console.error('Stripe error:', error);
    await sendErrorAlert('create-checkout-session', error, { productKey: data?.productKey });
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};