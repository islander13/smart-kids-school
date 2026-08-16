// ─────────────────────────────────────────────────────────────────────────
// Netlify Function : list-my-certificates
// ─────────────────────────────────────────────────────────────────────────
// Renvoie, pour le compte qui appelle (JWT), ses propres certificats de
// réussite + ceux des enfants liés (app_metadata.linkedChildren, même
// filtrage que children-progress.js) — pour affichage dans "Mon espace",
// sans repasser par l'admin pour chaque téléchargement.
//
// Minimisation : seuls les champs nécessaires à l'affichage/l'ouverture du
// certificat (nom, cours, langue, date, lien) sont renvoyés, jamais l'id
// interne ni l'email complet du compte visé au-delà de ce que
// children-progress.js expose déjà pour les enfants liés.
// ─────────────────────────────────────────────────────────────────────────

const { getDatabase } = require('@netlify/database');
const { COURSES, LANGS, toDateStr, buildCertOpenUrl } = require('./lib/certificateCourses');

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
    const ownerIds = [caller.sub, ...linked.map((c) => c.id)];
    const emailById = new Map([[caller.sub, null], ...linked.map((c) => [c.id, c.email])]);

    const { sql } = getDatabase({ connectionString: process.env.NETLIFY_DB_URL });
    // Une requête par compte (plutôt qu'un WHERE ... = ANY(...)) : reste sur
    // le même pattern "égalité simple" déjà utilisé partout ailleurs dans le
    // projet, sans dépendre du support des paramètres tableau du pilote —
    // un parent a rarement plus de 2-3 enfants liés, le coût est négligeable.
    const rowsPerOwner = await Promise.all(
      ownerIds.map((id) => sql`SELECT * FROM certificates WHERE user_id = ${id} ORDER BY issued_date DESC, created_at DESC`)
    );
    const rows = rowsPerOwner.flat();

    const certificates = rows.map((c) => ({
      studentName: c.student_name,
      courseLabel: COURSES[c.course_key] || c.course_key,
      langLabel: LANGS[c.lang] || c.lang,
      issuedDate: toDateStr(c.issued_date),
      openUrl: buildCertOpenUrl(c),
      // "own" pour le compte qui appelle, sinon l'email de l'enfant lié (déjà
      // exposé au parent par children-progress.js) pour distinguer à qui
      // appartient chaque certificat.
      owner: c.user_id === caller.sub ? 'own' : (emailById.get(c.user_id) || 'own'),
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ certificates }),
    };
  } catch (err) {
    console.error('list-my-certificates error:', err.message);
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
