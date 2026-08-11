// ─────────────────────────────────────────────────────────────────────────
// Code de liaison "Mon espace" : dérivé de façon déterministe depuis l'ID
// Identity du compte, jamais stocké nulle part. Remplace l'ancien système
// où n'importe quel compte connecté pouvait lier n'importe quel autre
// compte en devinant/connaissant simplement son email (aucune preuve que
// le "parent" a le droit de voir la progression du "enfant" visé) — un
// vrai IDOR. Avec un code, un compte ne peut être lié que par quelqu'un à
// qui son titulaire a explicitement communiqué ce code (visible seulement
// une fois connecté à CE compte précis).
//
// HMAC-SHA256(ADMIN_SECRET, "link-code:" + userId) plutôt qu'un nouveau
// secret dédié : ADMIN_SECRET est déjà une variable d'environnement
// obligatoire (voir lib/adminAuth.js), donc rien à ajouter au dashboard
// Netlify pour activer cette fonctionnalité. Le préfixe "link-code:" sépare
// cet usage de tout autre usage futur de la même clé (séparation de domaine).
// ─────────────────────────────────────────────────────────────────────────

const crypto = require('crypto');

function computeLinkCode(userId) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error('ADMIN_SECRET manquant');
  const digest = crypto.createHmac('sha256', secret).update(`link-code:${userId}`).digest('hex').toUpperCase();
  return `${digest.slice(0, 4)}-${digest.slice(4, 8)}`;
}

// Comparaison à temps constant : même principe que isValidAdminKey (évite
// qu'un attaquant déduise un code correct octet par octet en mesurant le
// temps de réponse d'une comparaison naïve sur des milliers de comptes).
function codeMatches(candidateCode, submittedCode) {
  const a = Buffer.from(String(candidateCode));
  const b = Buffer.from(String(submittedCode || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { computeLinkCode, codeMatches };
