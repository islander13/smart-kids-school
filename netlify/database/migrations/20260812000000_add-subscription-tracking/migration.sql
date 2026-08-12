-- Jusqu'ici, rien ne reliait une ligne `enrollments` au client/abonnement
-- Stripe correspondant : impossible de savoir, à la résiliation d'un
-- abonnement, à quel compte "Mon espace" ça correspond. Ces deux colonnes
-- sont renseignées par stripe-webhook.js au moment du paiement (recurring
-- uniquement pour stripe_subscription_id — absent pour un paiement unique),
-- et relues quand Stripe envoie `customer.subscription.deleted`.

ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

CREATE INDEX IF NOT EXISTS idx_enrollments_stripe_customer_id
  ON enrollments (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
