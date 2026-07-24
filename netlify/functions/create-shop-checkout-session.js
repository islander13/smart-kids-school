// ─────────────────────────────────────────────────────────────────────────
// Netlify Function : create-shop-checkout-session
// ─────────────────────────────────────────────────────────────────────────
// Équivalent de create-checkout-session.js, mais pour les produits de la
// boutique (ebooks...) : toujours un paiement unique (jamais d'abonnement),
// pas de données enfant/parent à collecter, et une ligne dans `shop_orders`
// plutôt que `enrollments`.
// ─────────────────────────────────────────────────────────────────────────

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { getDatabase } = require('@netlify/database');
const { SHOP_PRODUCTS } = require('./lib/shopProducts');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const data = JSON.parse(event.body);
    const { productKey, customerEmail } = data;

    if (!productKey || !SHOP_PRODUCTS[productKey]) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid product key' }) };
    }
    if (!customerEmail || !customerEmail.includes('@')) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid email' }) };
    }

    const product = SHOP_PRODUCTS[productKey];

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment', // jamais récurrent pour un produit numérique
      line_items: [{
        price_data: {
          currency: 'chf',
          product_data: { name: product.name, description: product.description },
          unit_amount: product.price * 100,
        },
        quantity: 1,
      }],
      currency: 'chf',
      customer_email: customerEmail,
      adaptive_pricing: { enabled: false },
      payment_method_types: ['card'],
      // Page dédiée (différente de /merci, propre aux enrollments) : affiche
      // le lien de téléchargement une fois le paiement confirmé.
      return_url: `${process.env.SITE_URL || 'https://smartkids-school.ch'}/shop/merci?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        type: 'shop', // distingue une commande boutique d'une inscription, lu par stripe-webhook.js
        productKey,
      },
      locale: 'fr',
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });

    // Enregistrement en base (best-effort, comme create-checkout-session.js).
    try {
      const { sql } = getDatabase({ connectionString: process.env.NETLIFY_DB_URL });
      await sql`
        INSERT INTO shop_orders (status, product_key, email, stripe_session_id)
        VALUES ('checkout_started', ${productKey}, ${customerEmail}, ${session.id})
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
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: error.message || 'Internal server error' }) };
  }
};
