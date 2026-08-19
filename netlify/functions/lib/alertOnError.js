// ─────────────────────────────────────────────────────────────────────────
// Alerte par email quand une fonction critique plante avec une erreur NON
// gérée (pas les erreurs déjà attrapées et journalisées en interne, comme
// une redélivrance Stripe ou une écriture DB non bloquante — celles-là sont
// déjà loguées, volontairement silencieuses côté appelant). Réutilise le
// même mécanisme que le reste du site (Netlify Forms → notification email
// configurée dans le dashboard Netlify) plutôt qu'un service tiers dédié.
//
// Volontairement best-effort : si l'envoi de l'alerte échoue lui-même
// (réseau, Forms indisponible...), on journalise seulement — une fonction
// ne doit jamais planter à cause de l'alerte censée signaler qu'elle a
// planté.
// ─────────────────────────────────────────────────────────────────────────

async function sendErrorAlert(functionName, error, context) {
  try {
    const siteUrl = process.env.SITE_URL || 'https://smartkids-school.ch';
    const params = new URLSearchParams();
    params.append('form-name', 'function-error-alert');
    params.append('functionName', functionName);
    params.append('errorMessage', (error && error.message) || String(error));
    params.append('context', context ? JSON.stringify(context).slice(0, 2000) : '');
    params.append('timestamp', new Date().toISOString());

    const res = await fetch(siteUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    if (!res.ok) {
      console.error(`sendErrorAlert: notification non envoyée pour ${functionName}, statut ${res.status}`);
    }
  } catch (alertErr) {
    console.error(`sendErrorAlert: échec de l'envoi lui-même pour ${functionName} (non bloquant):`, alertErr.message);
  }
}

module.exports = { sendErrorAlert };
