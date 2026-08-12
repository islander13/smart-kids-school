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
// HMAC-SHA256(LINK_CODE_SECRET, "link-code:" + userId), avec un secret DÉDIÉ
// — pas ADMIN_SECRET. Le réutiliser semblait pratique (rien à ajouter au
// dashboard Netlify) mais élargissait inutilement l'impact d'une fuite :
// ADMIN_SECRET apparaît en clair dans l'URL de /admin (historique navigateur,
// logs, referrer) ; s'il fuit, un attaquant pourrait sinon aussi calculer le
// code de liaison de n'importe quel compte (ID Identity connu) et se lier à
// lui pour lire sa progression — un accès qui n'a rien à voir avec /admin.
// Secrets séparés = fuite de l'un sans impact sur l'autre.
// ─────────────────────────────────────────────────────────────────────────

const crypto = require('crypto');

function computeLinkCode(userId) {
  const secret = process.env.LINK_CODE_SECRET;
  if (!secret) throw new Error('LINK_CODE_SECRET manquant');
  const digest = crypto.createHmac('sha256', secret).update(`link-code:${userId}`).digest('hex').toUpperCase();
  return `${digest.slice(0, 4)}-${digest.slice(4, 8)}`;
}

// Ignore tout ce qui n'est pas alphanumérique (tiret, espace...) avant de
// comparer : un parent qui reçoit le code oralement ou par SMS tape très
// naturellement "ABCD1234" (sans le tiret) ou "ABCD 1234" — sans ça, une
// saisie par ailleurs correcte échouait avec un message "aucun compte ne
// correspond", qui donne l'impression trompeuse que le code lui-même est
// faux plutôt que juste mal formaté.
function normalizeCode(code) {
  return String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// Comparaison à temps constant : même principe que isValidAdminKey (évite
// qu'un attaquant déduise un code correct octet par octet en mesurant le
// temps de réponse d'une comparaison naïve sur des milliers de comptes).
function codeMatches(candidateCode, submittedCode) {
  const a = Buffer.from(normalizeCode(candidateCode));
  const b = Buffer.from(normalizeCode(submittedCode));
  return a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b);
}

module.exports = { computeLinkCode, codeMatches, normalizeCode };
