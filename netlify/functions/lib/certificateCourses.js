// ─────────────────────────────────────────────────────────────────────────
// Catalogue des cours/langues pour les certificats — partagé entre
// admin-certificates.js et list-my-certificates.js. Doit rester synchronisé
// avec l'objet `courses` de public/sks-certificate.html : ce fichier-là est
// une page statique sans étape de build, donc pas partageable directement
// avec le code serveur (CommonJS/Node).
// ─────────────────────────────────────────────────────────────────────────

const COURSES = {
  scratch: 'Scratch Basics',
  advscratch: 'Advanced Scratch',
  turtle: 'Python Turtle',
  python: 'Python',
  bootcamp: 'Bootcamp / Stage',
};
const LANGS = { fr: 'Français', en: 'English', de: 'Deutsch' };

// Le pilote peut renvoyer une colonne DATE en objet Date (UTC minuit) ou en
// chaîne selon le contexte — les deux formes doivent aboutir à "AAAA-MM-JJ".
function toDateStr(v) {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

// Lien vers le générateur visuel (public/sks-certificate.html), pré-rempli :
// aucun fichier n'est stocké côté serveur, le PNG/PDF est reconstruit à la
// volée depuis ces paramètres.
function buildCertOpenUrl(cert) {
  const qs = new URLSearchParams({
    name: cert.student_name,
    course: cert.course_key,
    lang: cert.lang,
    date: toDateStr(cert.issued_date),
  });
  return `/sks-certificate.html?${qs.toString()}`;
}

module.exports = { COURSES, LANGS, toDateStr, buildCertOpenUrl };
