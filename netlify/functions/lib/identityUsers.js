// ─────────────────────────────────────────────────────────────────────────
// Opérations Netlify Identity côté admin (lister, chercher par email,
// inviter, couper/rétablir l'accès Mon espace) — utilisé par stripe-webhook.js
// (invitation + révocation automatiques) et par les pages admin-*.js
// (supervision manuelle). Pas d'endpoint admin "get user by email" côté
// GoTrue : on pagine tous les comptes pour chercher.
// ─────────────────────────────────────────────────────────────────────────

async function listAllUsers(identity) {
  const perPage = 100;
  const maxPages = 20;
  const all = [];
  for (let page = 1; page <= maxPages; page++) {
    const res = await fetch(`${identity.url}/admin/users?per_page=${perPage}&page=${page}`, {
      headers: { Authorization: `Bearer ${identity.token}` },
    });
    if (!res.ok) throw new Error(`admin list users failed: ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.users || [];
    all.push(...list);
    if (list.length < perPage) break;
  }
  return all;
}

// Récupère un compte par son id en un seul appel — à préférer à
// listAllUsers()+find() dès qu'on connaît déjà l'id (ex: venir d'un lien
// depuis une autre page admin), pour ne pas repaginer tous les comptes
// juste pour en retrouver un seul.
async function getUserById(identity, userId) {
  const res = await fetch(`${identity.url}/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${identity.token}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`admin get user failed: ${res.status}`);
  return res.json();
}

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

async function updateAppMetadata(identity, userId, currentAppMetadata, patch) {
  const res = await fetch(`${identity.url}/admin/users/${userId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${identity.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_metadata: { ...currentAppMetadata, ...patch } }),
  });
  if (!res.ok) throw new Error(`admin update user failed: ${res.status}`);
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
  await updateAppMetadata(identity, user.id, user.app_metadata, { subscriptionActive: active });
}

// Variante par ID plutôt que par email : utilisée par les pages admin, qui
// ont déjà la liste complète des comptes (listAllUsers) et n'ont pas besoin
// de repaginer pour retrouver le compte à modifier.
async function setSubscriptionActiveById(identity, userId, currentAppMetadata, active) {
  await updateAppMetadata(identity, userId, currentAppMetadata, { subscriptionActive: active });
}

// Invite un nouveau compte "Mon espace". Idempotent : si le compte existe
// déjà (paiement répété, double-clic...), GoTrue répond 422 "already
// exists" — traité comme un succès silencieux, pas une erreur.
async function inviteUser(identity, email) {
  if (!identity || !email) {
    return { invited: false, reason: 'missing_identity_or_email' };
  }
  const res = await fetch(`${identity.url}/admin/users`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${identity.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (res.ok) return { invited: true };
  const body = await res.json().catch(() => ({}));
  const alreadyExists = res.status === 422 && /already been registered|already exists/i.test(body.msg || body.error_description || '');
  if (alreadyExists) return { invited: false, reason: 'already_exists' };
  throw new Error(`admin invite user failed (${res.status}): ${body.msg || body.error_description || JSON.stringify(body)}`);
}

module.exports = { listAllUsers, findUserByEmail, getUserById, setSubscriptionActive, setSubscriptionActiveById, inviteUser };
