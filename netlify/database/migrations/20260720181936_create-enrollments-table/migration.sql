-- Une seule table pour toutes les demandes d'inscription (tarifs, stages,
-- premium), de la soumission du formulaire jusqu'à la confirmation du
-- paiement par Stripe. Les détails spécifiques à chaque source (enfants,
-- message, créneaux souhaités...) vivent dans `details` (JSON) plutôt que
-- dans des colonnes séparées, pour rester simple et flexible.

CREATE TABLE IF NOT EXISTS enrollments (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- D'où vient la demande : 'tarifs', 'stages', ou 'premium'
  source TEXT NOT NULL,

  -- 'form_submitted' (formulaire rempli, paiement pas encore confirmé)
  -- 'payment_confirmed' (Stripe a confirmé le paiement, via le webhook)
  status TEXT NOT NULL DEFAULT 'form_submitted',

  parent_name TEXT,
  email TEXT,
  phone TEXT,

  -- Ex: 'solo-m6', 'stage-2children', 'premium-monthly'
  product_key TEXT,
  plan_label TEXT,

  -- Rempli uniquement quand status = 'payment_confirmed'
  amount_chf NUMERIC(10, 2),
  stripe_session_id TEXT,

  -- Enfants, message, créneaux souhaités, objectifs... selon la source.
  details JSONB
);

CREATE INDEX IF NOT EXISTS idx_enrollments_email ON enrollments (email);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments (status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_stripe_session_id
  ON enrollments (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;
