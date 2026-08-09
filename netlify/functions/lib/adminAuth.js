// ─────────────────────────────────────────────────────────────────────────
// Vérification de la clé secrète des pages admin (?key=...), partagée entre
// admin-enrollments.js et admin-espace-activity.js.
// ─────────────────────────────────────────────────────────────────────────

const crypto = require('crypto');

// Comparaison à temps constant : évite qu'un attaquant déduise la clé
// correcte octet par octet en mesurant le temps de réponse (même principe
// que lib/downloadToken.js).
function isValidAdminKey(providedKey) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || !providedKey) return false;
  const a = Buffer.from(String(providedKey));
  const b = Buffer.from(secret);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { isValidAdminKey };
