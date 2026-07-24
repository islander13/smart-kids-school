// ─────────────────────────────────────────────────────────────────────────
// Netlify Function : shop-download
// ─────────────────────────────────────────────────────────────────────────
// Livre le fichier d'un produit acheté, uniquement si le jeton signé fourni
// (généré par stripe-webhook.js à la confirmation du paiement) est valide,
// pas expiré, et correspond bien à la commande. Le fichier lui-même vit
// dans un store Netlify Blobs nommé "ebooks" — jamais dans /public, qui
// serait accessible par n'importe qui connaissant l'URL.
//
// ⚠️ AVANT MISE EN SERVICE :
//   1. Variable d'environnement SHOP_DOWNLOAD_SECRET à définir (voir
//      lib/downloadToken.js).
//   2. Le fichier réel doit être déposé dans le store Blobs "ebooks", sous
//      la clé définie par `fileKey` dans lib/shopProducts.js. Depuis la
//      CLI : `netlify blobs:set ebooks premier-pas-en-python.pdf --input ./mon-fichier.pdf`
//   3. Limite de taille : une Function Netlify classique (comme celle-ci)
//      répond en un seul bloc, avec une limite de l'ordre de 6 Mo. Pour un
//      ebook plus volumineux, il faudra soit convertir cette fonction en
//      "Streaming Function" (format ESM, réponse en flux), soit héberger
//      le fichier ailleurs (ex: URL signée S3) et faire un redirect 302
//      depuis ici plutôt que de renvoyer le fichier directement.
// ─────────────────────────────────────────────────────────────────────────

const { getDatabase } = require('@netlify/database');
const { getStore } = require('@netlify/blobs');
const { verifyDownloadToken } = require('./lib/downloadToken');
const { SHOP_PRODUCTS } = require('./lib/shopProducts');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const sessionId = event.queryStringParameters?.session_id;
  const token = event.queryStringParameters?.token;
  if (!sessionId || !token) {
    return { statusCode: 400, body: 'Lien de téléchargement invalide.' };
  }

  try {
    const { sql } = getDatabase({ connectionString: process.env.NETLIFY_DB_URL });
    const rows = await sql`
      SELECT product_key, download_token, download_token_expires_at, status
      FROM shop_orders
      WHERE stripe_session_id = ${sessionId}
      LIMIT 1
    `;

    if (rows.length === 0 || rows[0].status !== 'payment_confirmed') {
      return { statusCode: 403, body: 'Commande introuvable ou paiement non confirmé.' };
    }

    const order = rows[0];
    const valid = verifyDownloadToken(sessionId, order.product_key, order.download_token_expires_at, token)
      && token === order.download_token;
    if (!valid) {
      return { statusCode: 403, body: 'Lien de téléchargement invalide ou expiré. Contactez-nous à contact@smartkids-school.ch.' };
    }

    const product = SHOP_PRODUCTS[order.product_key];
    if (!product) {
      return { statusCode: 404, body: 'Produit introuvable.' };
    }

    const store = getStore('ebooks');
    const file = await store.get(product.fileKey, { type: 'arrayBuffer' });
    if (!file) {
      console.error(`Fichier manquant dans le store Blobs "ebooks" pour la clé "${product.fileKey}"`);
      return { statusCode: 404, body: "Fichier introuvable côté serveur — le fichier n'a probablement pas encore été déposé (voir le commentaire en tête de ce fichier)." };
    }

    // Best-effort : compte le téléchargement, jamais bloquant pour le client.
    try {
      await sql`UPDATE shop_orders SET download_count = download_count + 1, updated_at = NOW() WHERE stripe_session_id = ${sessionId}`;
    } catch (countError) {
      console.error('Incrémentation download_count échouée (non bloquante):', countError.message);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${product.fileKey}"`,
        'Cache-Control': 'private, no-store',
      },
      body: Buffer.from(file).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('shop-download error:', error.message);
    return { statusCode: 500, body: 'Erreur serveur.' };
  }
};
