// ─────────────────────────────────────────────────────────────────────────
// Netlify Function : stripe-webhook
// ─────────────────────────────────────────────────────────────────────────
// Reçoit les événements envoyés DIRECTEMENT par Stripe (pas par le navigateur
// du client). Contrairement à la redirection vers /merci, cet appel a lieu
// même si le client ferme son onglet juste après avoir payé — c'est le seul
// signal fiable à 100% qu'un paiement a réellement abouti.
//
// Configuration requise dans Stripe (Developers → Webhooks → Add endpoint) :
//   URL         : https://smartkids-school.ch/.netlify/functions/stripe-webhook
//   Événements  : checkout.session.completed
// Stripe fournit alors un "Signing secret" (whsec_...) à coller dans les
// variables d'environnement Netlify sous STRIPE_WEBHOOK_SECRET.
// ─────────────────────────────────────────────────────────────────────────

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { getDatabase } = require('@netlify/database');

function sourceFromProductKey(productKey) {
  if (!productKey) return 'tarifs';
  if (productKey.startsWith('stage-')) return 'stages';
  if (productKey.startsWith('premium-')) return 'premium';
  return 'tarifs';
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const signature = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64')
    : event.body;

  let stripeEvent;
  try {
    // Vérifie que l'appel vient bien de Stripe (empêche quiconque de
    // fabriquer un faux événement "paiement réussi").
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature invalide:', err.message);
    return { statusCode: 400, body: `Webhook signature invalide: ${err.message}` };
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;

    // Trace fiable et permanente dans les logs Netlify (Functions → stripe-webhook)
    // : même si tout le reste échoue, la preuve du paiement existe ici.
    console.log('✅ Paiement confirmé par Stripe:', JSON.stringify({
      sessionId: session.id,
      email: session.customer_email || session.customer_details?.email,
      amountTotal: session.amount_total ? session.amount_total / 100 : null,
      currency: session.currency,
      productKey: session.metadata?.productKey,
      parentName: session.metadata?.parentName,
      metadata: session.metadata,
    }, null, 2));

    // Marque la ligne comme payée (créée lors de create-checkout-session.js).
    // UPSERT : si la ligne n'existait pas (ex: écriture initiale échouée),
    // on la crée quand même — le paiement confirmé ne doit jamais se perdre.
    try {
      // En "Lambda compatibility mode" (exports.handler), Netlify n'injecte
      // pas automatiquement la chaîne de connexion : on la passe nous-mêmes.
      const { sql } = getDatabase({ connectionString: process.env.NETLIFY_DB_URL });
      const email = session.customer_email || session.customer_details?.email || null;
      const amount = session.amount_total ? session.amount_total / 100 : null;
      await sql`
        INSERT INTO enrollments (
          source, status, parent_name, email, phone,
          product_key, stripe_session_id, amount_chf, details, updated_at
        ) VALUES (
          ${sourceFromProductKey(session.metadata?.productKey)}, 'payment_confirmed',
          ${session.metadata?.parentName || null}, ${email}, ${session.metadata?.phone || null},
          ${session.metadata?.productKey || null}, ${session.id}, ${amount},
          ${JSON.stringify(session.metadata || {})}, NOW()
        )
        ON CONFLICT (stripe_session_id) DO UPDATE SET
          status = 'payment_confirmed',
          amount_chf = ${amount},
          updated_at = NOW()
      `;
    } catch (dbError) {
      console.error('Mise à jour base de données échouée (non bloquante):', dbError.message);
    }

    // Notification par email : réutilise Netlify Forms (déjà en place pour
    // les autres formulaires du site) pour envoyer un email de confirmation
    // sans dépendre d'un nouveau service tiers.
    try {
      const siteUrl = process.env.SITE_URL || 'https://smartkids-school.ch';
      const params = new URLSearchParams();
      params.append('form-name', 'payment-confirmed');
      params.append('sessionId', session.id);
      params.append('email', session.customer_email || session.customer_details?.email || '');
      params.append('amount', session.amount_total ? `${session.amount_total / 100} ${(session.currency || 'chf').toUpperCase()}` : '');
      params.append('productKey', session.metadata?.productKey || '');
      params.append('parentName', session.metadata?.parentName || '');
      params.append('phone', session.metadata?.phone || '');

      const res = await fetch(siteUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      if (!res.ok) {
        console.error('Notification Netlify Forms échouée (statut ' + res.status + '), mais le paiement est bien confirmé ci-dessus.');
      }
    } catch (notifyErr) {
      // Ne fait jamais échouer le webhook pour un problème de notification :
      // le paiement est déjà confirmé et loggé, c'est l'essentiel.
      console.error('Erreur notification (non bloquante):', notifyErr.message);
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
