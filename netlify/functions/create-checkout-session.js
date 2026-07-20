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

// Déduit la source (tarifs / stages / premium) à partir du productKey,
// pour classer chaque ligne de la table `enrollments`.
function sourceFromProductKey(productKey) {
  if (productKey.startsWith('stage-')) return 'stages';
  if (productKey.startsWith('premium-')) return 'premium';
  return 'tarifs';
}

// ─── Catalogue des produits (prix internes) ───
// Ces prix sont la SOURCE DE VÉRITÉ. Stripe ne les calcule pas, on les force.
const PRODUCTS = {
  // ─── SOLO — paiement mensuel (abonnement) ───
  'solo-m3':  { name: 'SKS Solo - 3 mois (paiement mensuel)',  price: 299, recurring: true, description: 'Cours individuel personnalisé. 4 séances de 1h30 par mois. Engagement minimum 3 mois.' },
  'solo-m6':  { name: 'SKS Solo - 6 mois (paiement mensuel)',  price: 269, recurring: true, description: 'Cours individuel personnalisé. 4 séances de 1h30 par mois. Engagement 6 mois.' },
  'solo-m12': { name: 'SKS Solo - 12 mois (paiement mensuel)', price: 249, recurring: true, description: 'Cours individuel personnalisé. 4 séances de 1h30 par mois. Engagement 12 mois.' },

  // ─── SOLO — paiement en une fois (paiement unique, ~10% de rabais) ───
  'solo-m3-once':  { name: 'SKS Solo - 3 mois (paiement unique)',  price: 799,  recurring: false, description: 'Cours individuel personnalisé, 3 mois réglés en une fois. Rabais paiement comptant.' },
  'solo-m6-once':  { name: 'SKS Solo - 6 mois (paiement unique)',  price: 1449, recurring: false, description: 'Cours individuel personnalisé, 6 mois réglés en une fois. Rabais paiement comptant.' },
  'solo-m12-once': { name: 'SKS Solo - 12 mois (paiement unique)', price: 2689, recurring: false, description: 'Cours individuel personnalisé, 12 mois réglés en une fois. Rabais paiement comptant.' },

  // ─── DUO (tarif total famille) — paiement mensuel (abonnement) ───
  'duo-m3':  { name: 'SKS Duo - 3 mois (paiement mensuel)',  price: 398, recurring: true, description: 'Cours partagé pour 2 enfants (frère/sœur/ami). Tarif total famille. Engagement minimum 3 mois.' },
  'duo-m6':  { name: 'SKS Duo - 6 mois (paiement mensuel)',  price: 358, recurring: true, description: 'Cours partagé pour 2 enfants. Tarif total famille. Engagement 6 mois.' },
  'duo-m12': { name: 'SKS Duo - 12 mois (paiement mensuel)', price: 338, recurring: true, description: 'Cours partagé pour 2 enfants. Tarif total famille. Engagement 12 mois.' },

  // ─── DUO — paiement en une fois (paiement unique, ~10% de rabais) ───
  'duo-m3-once':  { name: 'SKS Duo - 3 mois (paiement unique)',  price: 1079, recurring: false, description: 'Cours partagé pour 2 enfants, 3 mois réglés en une fois. Rabais paiement comptant.' },
  'duo-m6-once':  { name: 'SKS Duo - 6 mois (paiement unique)',  price: 1929, recurring: false, description: 'Cours partagé pour 2 enfants, 6 mois réglés en une fois. Rabais paiement comptant.' },
  'duo-m12-once': { name: 'SKS Duo - 12 mois (paiement unique)', price: 3649, recurring: false, description: 'Cours partagé pour 2 enfants, 12 mois réglés en une fois. Rabais paiement comptant.' },

  // ─── PREMIUM (prix inchangés) ───
  'premium-monthly': { name: 'SKS Premium - Sans Engagement',              price: 999,   recurring: true,  description: 'Mentorat individuel avec le fondateur : 2 séances par semaine, projet publié en 12 mois, préparation aux concours, bilan trimestriel, accès direct au fondateur, 2 stages offerts/an.' },
  'premium-yearly':  { name: 'SKS Premium - 12 mois (paiement total -10%)', price: 10789, recurring: false, description: 'Offre Premium en paiement total 12 mois avec rabais 10%.' },

  // ─── STAGES (prix inchangés) ───
  'stage-1child':    { name: 'SKS Stage de Programmation - 1 Enfant',                    price: 449, recurring: false, description: 'Stage de programmation. 4 demi-journées de 3h sur 1 semaine de vacances scolaires.' },
  'stage-2children': { name: 'SKS Stage de Programmation - 2 Enfants (forfait famille)', price: 799, recurring: false, description: 'Stage pour 2 enfants. Forfait famille avec rabais 11% (économie 99 CHF).' },
};

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

  try {
    const data = JSON.parse(event.body);
    const { productKey, customerEmail, metadata } = data;

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

    // ─── Création de la session Checkout ───
    const session = await stripe.checkout.sessions.create({
      mode: product.recurring ? 'subscription' : 'payment',
      line_items: lineItems,
      currency: 'chf',  // ⚠️ Force CHF au niveau session aussi
      customer_email: customerEmail,
      // ⚠️ DÉSACTIVE Adaptive Pricing — c'est la clé du succès
      adaptive_pricing: { enabled: false },
      // Méthodes de paiement
      payment_method_types: ['card'],
      // URLs de retour
      success_url: `${process.env.SITE_URL || 'https://smartkids-school.ch'}/merci?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL || 'https://smartkids-school.ch'}/tarifs`,
      // Métadonnées (utiles pour suivi côté Stripe)
      metadata: {
        productKey: productKey,
        ...metadata,  // parent name, child names, age, etc.
      },
      // Locale FR (vos clients sont francophones)
      locale: 'fr',
      // Permettre les codes promo
      allow_promotion_codes: true,
      // Collecte de la facturation
      billing_address_collection: 'auto',
    });

    // ─── Enregistrement en base (best-effort) ───
    // Une erreur ici ne doit jamais empêcher le client de payer : le
    // paiement reste la priorité, la trace en base est un complément.
    try {
      const { sql } = getDatabase();
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
      body: JSON.stringify({ url: session.url, sessionId: session.id }),
    };
  } catch (error) {
    console.error('Stripe error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};