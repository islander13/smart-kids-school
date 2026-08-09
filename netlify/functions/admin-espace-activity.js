// ─────────────────────────────────────────────────────────────────────────
// Netlify Function : admin-espace-activity
// ─────────────────────────────────────────────────────────────────────────
// Vue interne (non listée, non indexée) sur l'activité de "Mon espace" :
// qui a un compte, quel rôle (élève/parent — juste une préférence
// d'affichage, voir RoleSwitcher), combien de vidéos vues, quels badges,
// dernière activité. Même protection que admin-enrollments.js (clé secrète
// dans l'URL, variable d'environnement ADMIN_SECRET).
//
// Accès : https://smartkids-school.ch/admin/espace?key=VOTRE_CLE
// (le raccourci est défini dans public/_redirects)
//
// Contrairement à admin-enrollments.js (base Postgres), les données
// viennent de Netlify Identity : context.clientContext.identity fournit un
// token admin sur l'API Identity du site, disponible sur CHAQUE invocation
// de fonction dès qu'Identity est activé — même sans JWT appelant, donc
// utilisable depuis cette page protégée par clé plutôt que par login.
// ─────────────────────────────────────────────────────────────────────────

const { isValidAdminKey } = require('./lib/adminAuth');

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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

function renderPage({ rows, stats, key }) {
  const roleLabel = (role) =>
    role === 'student' ? '<span style="background:#e0e7ff;color:#232999;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:600;">élève</span>'
    : role === 'parent' ? '<span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:600;">parent</span>'
    : '<span style="background:#f1f5f9;color:#64748b;padding:2px 8px;border-radius:999px;font-size:12px;">—</span>';

  const rowsHtml = rows.map(r => `
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 12px;"><a href="mailto:${escapeHtml(r.email)}" style="color:#232999;">${escapeHtml(r.email)}</a></td>
      <td style="padding:10px 12px;">${roleLabel(r.role)}</td>
      <td style="padding:10px 12px;text-align:center;">${r.watchedCount}</td>
      <td style="padding:10px 12px;text-align:center;">${r.badgeCount}</td>
      <td style="padding:10px 12px;">${r.linkedChildrenCount > 0 ? r.linkedChildrenCount : '—'}</td>
      <td style="padding:10px 12px;white-space:nowrap;font-size:13px;color:#64748b;">${r.lastActivityAt ? new Date(r.lastActivityAt).toLocaleString('fr-CH') : 'jamais'}</td>
    </tr>
  `).join('');

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Activité Mon espace — Smart Kids School</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; margin: 0; padding: 32px; color: #0f172a; }
    .wrap { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .sub { color: #64748b; font-size: 14px; margin-bottom: 24px; }
    .nav { margin-bottom: 20px; }
    .nav a { color: #232999; font-size: 13px; font-weight: 600; text-decoration: none; }
    .stats { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .stat { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; min-width: 140px; }
    .stat .n { font-size: 24px; font-weight: 700; }
    .stat .l { font-size: 12px; color: #64748b; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    th { text-align: left; padding: 10px 12px; background: #f1f5f9; font-size: 12px; text-transform: uppercase; color: #64748b; }
    tr:last-child td { border-bottom: none; }
    .empty { padding: 40px; text-align: center; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="nav"><a href="/admin?key=${encodeURIComponent(key)}">← Inscriptions</a></div>
    <h1>Activité "Mon espace"</h1>
    <p class="sub">${rows.length} compte(s) Identity</p>

    <div class="stats">
      <div class="stat"><div class="n">${stats.total}</div><div class="l">Comptes créés</div></div>
      <div class="stat"><div class="n">${stats.withActivity}</div><div class="l">Au moins 1 vidéo vue</div></div>
      <div class="stat"><div class="n">${stats.withBadge}</div><div class="l">Au moins 1 badge</div></div>
      <div class="stat"><div class="n">${stats.activeLast7Days}</div><div class="l">Actifs (7 derniers jours)</div></div>
    </div>

    ${rows.length === 0 ? '<div class="empty">Aucun compte pour l\'instant.</div>' : `
    <table>
      <thead>
        <tr>
          <th>Email</th><th>Vue actuelle</th><th>Vidéos vues</th><th>Badges</th><th>Enfants liés</th><th>Dernière activité</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    `}
  </div>
</body>
</html>`;
}

exports.handler = async (event, context) => {
  const params = event.queryStringParameters || {};

  if (!isValidAdminKey(params.key)) {
    return { statusCode: 401, body: 'Accès refusé.' };
  }

  const identity = context.clientContext && context.clientContext.identity;
  if (!identity) {
    return { statusCode: 500, body: "Identity n'est pas disponible pour cette fonction (context.clientContext.identity manquant). Vérifiez qu'Identity est activé sur ce site." };
  }

  try {
    const users = await listAllUsers(identity);

    const rows = users.map((u) => {
      const meta = u.user_metadata || {};
      const progress = meta.progress || {};
      const appMeta = u.app_metadata || {};
      return {
        email: u.email,
        role: meta.role || null,
        watchedCount: Array.isArray(progress.watched) ? progress.watched.length : 0,
        badgeCount: progress.badges && typeof progress.badges === 'object' ? Object.keys(progress.badges).length : 0,
        linkedChildrenCount: Array.isArray(appMeta.linkedChildren) ? appMeta.linkedChildren.length : 0,
        lastActivityAt: progress.lastActivityAt || null,
      };
    }).sort((a, b) => {
      if (!a.lastActivityAt && !b.lastActivityAt) return 0;
      if (!a.lastActivityAt) return 1;
      if (!b.lastActivityAt) return -1;
      return new Date(b.lastActivityAt) - new Date(a.lastActivityAt);
    });

    const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const stats = {
      total: rows.length,
      withActivity: rows.filter(r => r.watchedCount > 0).length,
      withBadge: rows.filter(r => r.badgeCount > 0).length,
      activeLast7Days: rows.filter(r => r.lastActivityAt && new Date(r.lastActivityAt).getTime() >= sevenDaysAgo).length,
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: renderPage({ rows, stats, key: params.key }),
    };
  } catch (err) {
    console.error('admin-espace-activity error:', err.message);
    return { statusCode: 500, body: 'Erreur: ' + err.message };
  }
};
