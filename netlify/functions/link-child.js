// ─────────────────────────────────────────────────────────────────────────
// Netlify Function : link-child
// ─────────────────────────────────────────────────────────────────────────
// Rattache un compte élève au compte parent qui appelle cette fonction, à
// partir d'un CODE DE LIAISON (pas d'un email) — voir lib/linkCode.js.
//
// Avant, cette fonction cherchait le compte cible par email : n'importe
// quel compte connecté pouvait donc se lier n'importe quel autre compte
// existant en connaissant (ou en devinant) juste son adresse, sans la
// moindre preuve d'autorisation — un IDOR réel, permettant de lire la
// progression (vidéos vues, badges, dernière activité) de parfaits
// inconnus. Le code de liaison ferme cette faille : il n'est visible que
// par le titulaire du compte une fois connecté à CE compte précis (voir
// get-link-code.js), donc le lier suppose que ce titulaire l'a
// explicitement communiqué au demandeur.
//
// Nécessaire côté serveur (pas de fonction client équivalente) car
// app_metadata (où vit le lien) n'est pas modifiable par l'utilisateur
// lui-même via l'API Identity (seul user_metadata l'est) — ça évite qu'un
// parent puisse s'auto-déclarer lié à n'importe quel compte en modifiant
// ses propres données côté client.
//
// Netlify injecte automatiquement, pour toute invocation avec un JWT
// Identity valide dans l'en-tête Authorization :
//   - context.clientContext.user      → identité de l'appelant (décodée)
//   - context.clientContext.identity  → { url, token } avec des droits admin
//     sur l'instance Identity du site, pour appeler /admin/* ci-dessous.
// Pas de variable d'environnement à configurer pour ça.
// ─────────────────────────────────────────────────────────────────────────

const { computeLinkCode, codeMatches } = require('./lib/linkCode');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'method_not_allowed' }) };
  }

  const caller = context.clientContext && context.clientContext.user;
  const identity = context.clientContext && context.clientContext.identity;
  if (!caller || !identity) {
    return { statusCode: 401, body: JSON.stringify({ error: 'unauthorized' }) };
  }

  let code;
  try {
    ({ code } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'invalid_body' }) };
  }
  code = String(code || '').trim().toUpperCase();
  if (!code) {
    return { statusCode: 400, body: JSON.stringify({ error: 'code_required' }) };
  }

  try {
    const child = await findUserByCode(identity, code);
    if (!child) {
      return { statusCode: 404, body: JSON.stringify({ error: 'child_not_found' }) };
    }
    if (child.id === caller.sub) {
      return { statusCode: 400, body: JSON.stringify({ error: 'cannot_link_self' }) };
    }
    // Pas de vérification de "rôle élève" ici : le rôle n'est qu'une préférence
    // d'affichage que chaque compte peut changer à tout moment (voir
    // RoleSwitcher côté client), pas une propriété de sécurité — n'importe
    // quel compte a une progression et peut donc être lié.

    // context.clientContext.user est un résumé issu du JWT : on relit le
    // compte parent complet (app_metadata à jour) avant de le modifier.
    const parent = await adminGetUser(identity, caller.sub);
    const existing = Array.isArray((parent.app_metadata || {}).linkedChildren) ? parent.app_metadata.linkedChildren : [];
    if (existing.some((c) => c.id === child.id)) {
      return { statusCode: 200, body: JSON.stringify({ ok: true, alreadyLinked: true }) };
    }

    const linkedChildren = [...existing, { id: child.id, email: child.email }];
    await adminUpdateUser(identity, caller.sub, {
      app_metadata: { ...parent.app_metadata, linkedChildren },
    });

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('link-child error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: 'server_error' }) };
  }
};

async function adminGetUser(identity, userId) {
  const res = await fetch(`${identity.url}/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${identity.token}` },
  });
  if (!res.ok) throw new Error(`admin get user failed: ${res.status}`);
  return res.json();
}

async function adminUpdateUser(identity, userId, attributes) {
  const res = await fetch(`${identity.url}/admin/users/${userId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${identity.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(attributes),
  });
  if (!res.ok) throw new Error(`admin update user failed: ${res.status}`);
  return res.json();
}

// Le code de liaison est dérivé de l'ID du compte, jamais stocké : on pagine
// tous les comptes et on compare le code attendu de chacun (temps constant)
// au code soumis. Une école de cette taille compte au plus quelques
// centaines de comptes, largement couvert par la limite ci-dessous — même
// pattern de pagination que l'ancienne recherche par email.
async function findUserByCode(identity, code) {
  const perPage = 100;
  const maxPages = 20;
  for (let page = 1; page <= maxPages; page++) {
    const res = await fetch(`${identity.url}/admin/users?per_page=${perPage}&page=${page}`, {
      headers: { Authorization: `Bearer ${identity.token}` },
    });
    if (!res.ok) throw new Error(`admin list users failed: ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.users || [];
    const found = list.find((u) => codeMatches(computeLinkCode(u.id), code));
    if (found) return found;
    if (list.length < perPage) break;
  }
  return null;
}
