// ─────────────────────────────────────────────────────────────────────────
// Netlify Function : children-progress
// ─────────────────────────────────────────────────────────────────────────
// Renvoie, pour le compte parent qui appelle cette fonction, la progression
// minimale de chaque enfant lié (app_metadata.linkedChildren, écrit par
// link-child.js). Un parent ne peut lire que SES enfants liés — jamais la
// liste complète des comptes — grâce à ce filtrage côté serveur.
//
// Minimisation des données : seuls id, email et la liste des ids de vidéos
// vues sont renvoyés (pas de nom, pas d'autre champ de user_metadata). Le
// détail par section est recalculé côté client à partir d'ESPACE_SECTIONS
// (contenu public), pas besoin de le dupliquer ici.
// ─────────────────────────────────────────────────────────────────────────

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'method_not_allowed' }) };
  }

  const caller = context.clientContext && context.clientContext.user;
  const identity = context.clientContext && context.clientContext.identity;
  if (!caller || !identity) {
    return { statusCode: 401, body: JSON.stringify({ error: 'unauthorized' }) };
  }

  try {
    const parent = await adminGetUser(identity, caller.sub);
    const linked = Array.isArray((parent.app_metadata || {}).linkedChildren) ? parent.app_metadata.linkedChildren : [];

    const children = await Promise.all(
      linked.map(async (link) => {
        try {
          const child = await adminGetUser(identity, link.id);
          const progress = (child.user_metadata || {}).progress || {};
          return {
            id: child.id,
            email: child.email,
            watched: Array.isArray(progress.watched) ? progress.watched : [],
            lastActivityAt: progress.lastActivityAt || null,
          };
        } catch {
          return null; // compte supprimé entre-temps par ex. : on l'ignore plutôt que de faire échouer tout l'appel
        }
      })
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ children: children.filter(Boolean) }),
    };
  } catch (err) {
    console.error('children-progress error:', err.message);
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
