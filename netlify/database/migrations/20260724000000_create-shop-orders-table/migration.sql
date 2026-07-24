-- Commandes de la boutique (produits numériques : ebooks...), séparées de
-- `enrollments` car la nature de la donnée diffère (pas d'enfant, pas de
-- séances à planifier) : ici, un achat = un fichier à livrer une fois le
-- paiement confirmé.

CREATE TABLE IF NOT EXISTS shop_orders (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 'checkout_started' (session Stripe créée) puis 'payment_confirmed'
  -- (webhook Stripe reçu)
  status TEXT NOT NULL DEFAULT 'checkout_started',

  -- Ex: 'premier-pas-en-python' — clé du produit dans le catalogue
  product_key TEXT NOT NULL,

  email TEXT,
  stripe_session_id TEXT,
  amount_chf NUMERIC(10, 2),

  -- Jeton de téléchargement signé (HMAC), généré à la confirmation du
  -- paiement. Le fichier lui-même n'est jamais exposé par une URL publique
  -- fixe : il faut ce jeton, encore valide, pour le récupérer
  -- (voir netlify/functions/shop-download.js).
  download_token TEXT,
  download_token_expires_at TIMESTAMPTZ,
  download_count INTEGER NOT NULL DEFAULT 0,

  details JSONB
);

CREATE INDEX IF NOT EXISTS idx_shop_orders_email ON shop_orders (email);
CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON shop_orders (status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_shop_orders_stripe_session_id
  ON shop_orders (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;
