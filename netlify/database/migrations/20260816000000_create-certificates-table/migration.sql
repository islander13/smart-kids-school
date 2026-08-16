-- Certificats de réussite, générés depuis /admin/certificates : un
-- enregistrement par certificat, pour garder un historique par compte "Mon
-- espace" (qui a reçu quoi, quand) et pouvoir supprimer une entrée créée par
-- erreur. Le PDF/PNG n'est jamais stocké ici : il est reconstruit à la volée
-- par public/sks-certificate.html à partir de ces colonnes, via un lien
-- généré par admin-certificates.js (name/course/lang/date en query string).

CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Compte "Mon espace" (Netlify Identity) auquel ce certificat est rattaché.
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,

  -- Nom imprimé sur le certificat, saisi à la main par l'admin (peut différer
  -- du titulaire du compte : compte parent, prénom de l'enfant...).
  student_name TEXT NOT NULL,

  -- Doit correspondre à une clé de l'objet `courses` dans sks-certificate.html
  -- (scratch, advscratch, turtle, python, bootcamp).
  course_key TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'fr',
  issued_date DATE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates (user_id);
