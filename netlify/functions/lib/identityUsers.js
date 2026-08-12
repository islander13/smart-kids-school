// ─────────────────────────────────────────────────────────────────────────
// Recherche d'un compte Netlify Identity par email, et mise à jour de son
// app_metadata.subscriptionActive — utilisé pour couper/rétablir l'accès à
// "Mon espace" quand un abonnement Stripe est résilié/repris (voir
// stripe-webhook.js). Pas d'endpoint admin "get user by email" côté GoTrue :
// on pagine tous les comptes, comme link-child.js et admin-espace-activity.js
// le font déjà pour d'autres besoins.
// ─────────────────────────────────────────────────────────────────────────

async function findUserByEmail(identity, email) {
  const target = String(email || '').trim().toLowerCase();
  if (!target) return null;
  const perPage = 100;
  const maxPages = 20;
  for (let page = 1; page <= maxPages; page++) {
    const res = await fetch(`${identity.url}/admin/users?per_page=${perPage}&page=${page}`, {
      headers: { Authorization: `Bearer ${identity.token}` },
    });
    if (!res.ok) throw new Error(`admin list users failed: ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.users || [];
    const found = list.find((u) => String(u.email || '').toLowerCase() === target);
    if (found) return found;
    if (list.length < perPage) break;
  }
  return null;
}

// active === false : coupe l'accès (compte gardé, progression conservée) —
// voir la vérification côté client dans espace.tsx.
// active === true : rétablit l'accès (reprise d'abonnement après résiliation).
async function setSubscriptionActive(identity, email, active) {
  if (!identity || !email) return;
  const user = await findUserByEmail(identity, email);
  if (!user) {
    console.warn(`setSubscriptionActive: aucun compte Identity pour ${email} (active=${active})`);
    return;
  }
  const res = await fetch(`${identity.url}/admin/users/${user.id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${identity.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_metadata: { ...user.app_metadata, subscriptionActive: active } }),
  });
  if (!res.ok) throw new Error(`admin update user failed: ${res.status}`);
}

module.exports = { findUserByEmail, setSubscriptionActive };
