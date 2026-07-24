// ─────────────────────────────────────────────────────────────────────────
// Jeton de téléchargement signé, partagé entre stripe-webhook.js (qui le
// génère à la confirmation du paiement) et shop-download.js (qui le
// vérifie avant de livrer le fichier).
//
// Principe : le fichier n'est jamais accessible par une URL publique fixe.
// Pour le récupérer, il faut connaître le jeton — une signature HMAC du
// (sessionId + productKey + date d'expiration) avec un secret que seul le
// serveur connaît. Impossible à deviner ou à fabriquer sans ce secret.
//
// ⚠️ Nécessite la variable d'environnement Netlify SHOP_DOWNLOAD_SECRET
// (chaîne aléatoire longue, ex: générée avec `openssl rand -hex 32`)
// avant la mise en service — pas encore configurée à ce stade.
// ─────────────────────────────────────────────────────────────────────────

const crypto = require('crypto');

function getSecret() {
  const secret = process.env.SHOP_DOWNLOAD_SECRET;
  if (!secret) {
    throw new Error('SHOP_DOWNLOAD_SECRET manquant dans les variables d\'environnement Netlify');
  }
  return secret;
}

// Durée de validité du lien de téléchargement après confirmation du paiement.
const DEFAULT_VALIDITY_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

function signPayload(payload) {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

// Génère un nouveau jeton pour une commande. Retourne { token, expiresAt }.
function createDownloadToken(sessionId, productKey, validityMs = DEFAULT_VALIDITY_MS) {
  const expiresAt = new Date(Date.now() + validityMs);
  const payload = `${sessionId}:${productKey}:${expiresAt.toISOString()}`;
  return { token: signPayload(payload), expiresAt };
}

// Vérifie qu'un jeton correspond bien à la commande donnée et n'a pas expiré.
function verifyDownloadToken(sessionId, productKey, expiresAt, token) {
  if (!token || !expiresAt) return false;
  if (new Date(expiresAt).getTime() < Date.now()) return false;
  const expected = signPayload(`${sessionId}:${productKey}:${new Date(expiresAt).toISOString()}`);
  // Comparaison à temps constant : évite qu'un attaquant déduise le jeton
  // correct octet par octet en mesurant le temps de réponse.
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { createDownloadToken, verifyDownloadToken };
