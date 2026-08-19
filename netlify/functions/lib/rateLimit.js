// ─────────────────────────────────────────────────────────────────────────
// Rate limiting léger, en mémoire, par IP — pour les endpoints publics de
// création de session Stripe (create-checkout-session.js,
// create-shop-checkout-session.js). Pas d'infra externe (pas de Redis, pas
// de service tiers) : une instance de fonction chaude garde ce compteur en
// mémoire entre deux invocations, ce qui suffit à absorber un abus depuis
// une même IP (script, bot) sans gêner un vrai parent qui clique une ou deux
// fois sur "S'inscrire". Ce n'est PAS un rate limit distribué parfait — une
// invocation à froid ou une deuxième instance repart de zéro — mais c'est le
// niveau de protection proportionné demandé ici, au-dessus de ce que Netlify
// fait déjà à son niveau.
// ─────────────────────────────────────────────────────────────────────────

const WINDOW_MS = 60_000; // fenêtre glissante d'une minute
const MAX_REQUESTS = 8; // 8 tentatives de checkout par IP par minute — largement au-dessus d'un usage normal (un parent n'ouvre pas 8 fois le formulaire en 60s)
const MAX_TRACKED_IPS = 5000; // purge défensive si la map grossit trop (abus multi-IP, ou fonction restée chaude très longtemps)

const buckets = new Map(); // ip -> { count, windowStart }

function getClientIp(event) {
  const headers = event.headers || {};
  // Netlify pose x-nf-client-connection-ip avec l'IP réelle du visiteur,
  // fiable même derrière leur propre CDN — à préférer à x-forwarded-for qui
  // peut être falsifié par le client si jamais on l'utilisait seul.
  return headers['x-nf-client-connection-ip']
    || (headers['x-forwarded-for'] || '').split(',')[0].trim()
    || 'unknown';
}

// true = doit être bloqué (429). Purge aussi les entrées expirées au passage,
// pour ne pas garder indéfiniment une IP qui ne revient plus.
function isRateLimited(event, { windowMs = WINDOW_MS, max = MAX_REQUESTS } = {}) {
  const ip = getClientIp(event);
  const now = Date.now();

  const bucket = buckets.get(ip);
  if (!bucket || now - bucket.windowStart > windowMs) {
    buckets.set(ip, { count: 1, windowStart: now });
  } else {
    bucket.count += 1;
    if (bucket.count > max) return true;
  }

  if (buckets.size > MAX_TRACKED_IPS) {
    for (const [key, b] of buckets) {
      if (now - b.windowStart > windowMs) buckets.delete(key);
    }
  }

  return false;
}

module.exports = { isRateLimited, getClientIp };
