// ─────────────────────────────────────────────────────────────────────────
// Netlify Function : shop-order-lookup
// ─────────────────────────────────────────────────────────────────────────
// Appelée par la page /shop/merci (voir src/pages/shop/merci.tsx) avec le
// session_id fourni par Stripe dans l'URL de retour. Retourne l'état de la
// commande et, une fois le paiement confirmé, le lien de téléchargement.
//
// Le webhook Stripe (stripe-webhook.js) peut arriver un peu après la
// redirection du client vers /shop/merci — d'où le statut "pending" que le
// front peut utiliser pour réessayer quelques secondes plus tard, plutôt
// que d'afficher une erreur immédiate.
// ─────────────────────────────────────────────────────────────────────────

const { getDatabase } = require('@netlify/database');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const sessionId = event.queryStringParameters?.session_id;
  if (!sessionId) {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Missing session_id' }) };
  }

  try {
    const { sql } = getDatabase({ connectionString: process.env.NETLIFY_DB_URL });
    const rows = await sql`
      SELECT status, product_key, download_token, download_token_expires_at
      FROM shop_orders
      WHERE stripe_session_id = ${sessionId}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ status: 'pending' }) };
    }

    const order = rows[0];
    if (order.status !== 'payment_confirmed' || !order.download_token) {
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ status: 'pending' }) };
    }

    const params = new URLSearchParams({
      session_id: sessionId,
      token: order.download_token,
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        status: 'confirmed',
        productKey: order.product_key,
        downloadUrl: `/.netlify/functions/shop-download?${params.toString()}`,
        expiresAt: order.download_token_expires_at,
      }),
    };
  } catch (error) {
    console.error('shop-order-lookup error:', error.message);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
