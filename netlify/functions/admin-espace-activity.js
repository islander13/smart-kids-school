// ─────────────────────────────────────────────────────────────────────────
// Netlify Function : admin-espace-activity
// ─────────────────────────────────────────────────────────────────────────
// Vue interne (non listée, non indexée) sur l'activité de "Mon espace" :
// qui a un compte, quel rôle (élève/parent — juste une préférence
// d'affichage, voir RoleSwitcher), quelle formule payée, si l'accès est
// actif ou coupé, combien de vidéos vues, quels badges, dernière activité —
// avec une action pour couper/rétablir l'accès à la main (cas particuliers :
// email différent entre Stripe et le compte Identity, paiement par virement
// résilié manuellement, abus...). Même protection que admin-enrollments.js
// (clé secrète dans l'URL, variable d'environnement ADMIN_SECRET).
//
// Accès : https://smartkids-school.ch/admin/espace?key=VOTRE_CLE
// (le raccourci est défini dans public/_redirects)
//
// Les comptes viennent de Netlify Identity (context.clientContext.identity,
// token admin disponible sur CHAQUE invocation de fonction dès qu'Identity
// est activé) ; la formule payée vient de la base Postgres (`enrollments`),
// croisée par email — les deux systèmes ne se connaissent pas autrement.
// ─────────────────────────────────────────────────────────────────────────

const { getDatabase } = require('@netlify/database');
const { isValidAdminKey } = require('./lib/adminAuth');
const { listAllUsers, setSubscriptionActiveById } = require('./lib/identityUsers');

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderPage({ rows, stats, key, q }) {
  const roleLabel = (role) =>
    role === 'student' ? '<span style="background:#e0e7ff;color:#232999;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:600;">élève</span>'
    : role === 'parent' ? '<span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:600;">parent</span>'
    : '<span style="background:#f1f5f9;color:#475569;padding:2px 8px;border-radius:999px;font-size:12px;">—</span>';

  const subscriptionBadge = (active) =>
    active
      ? '<span style="background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap;">actif</span>'
      : '<span style="background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap;">coupé</span>';

  const rowsHtml = rows.map(r => `
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 12px;"><a href="mailto:${escapeHtml(r.email)}" style="color:#232999;">${escapeHtml(r.email)}</a></td>
      <td style="padding:10px 12px;">${roleLabel(r.role)}</td>
      <td style="padding:10px 12px;">${subscriptionBadge(r.subscriptionActive)}</td>
      <td style="padding:10px 12px;font-size:13px;">${escapeHtml(r.planLabel) || '<span style="color:#94a3b8;">—</span>'}</td>
      <td style="padding:10px 12px;text-align:center;">${r.watchedCount}</td>
      <td style="padding:10px 12px;text-align:center;">${r.badgeCount}</td>
      <td style="padding:10px 12px;">${r.linkedChildrenCount > 0 ? r.linkedChildrenCount : '—'}</td>
      <td style="padding:10px 12px;white-space:nowrap;font-size:13px;color:#64748b;">${r.lastActivityAt ? new Date(r.lastActivityAt).toLocaleString('fr-CH') : 'jamais'}</td>
      <td style="padding:10px 12px;white-space:nowrap;">
        <form method="POST" style="margin:0;" data-confirm="${r.subscriptionActive ? `Couper l’accès Mon espace pour ${escapeHtml(r.email)} ?` : `Réactiver l’accès Mon espace pour ${escapeHtml(r.email)} ?`}">
          <input type="hidden" name="key" value="${escapeHtml(key)}" />
          <input type="hidden" name="q" value="${escapeHtml(q)}" />
          <input type="hidden" name="action" value="toggle-subscription" />
          <input type="hidden" name="userId" value="${escapeHtml(r.id)}" />
          <input type="hidden" name="active" value="${r.subscriptionActive ? 'false' : 'true'}" />
          <button type="submit" style="padding:5px 10px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid ${r.subscriptionActive ? '#fecaca' : '#a7f3d0'};background:${r.subscriptionActive ? '#fef2f2' : '#f0fdf4'};color:${r.subscriptionActive ? '#991b1b' : '#065f46'};">
            ${r.subscriptionActive ? 'Couper l’accès' : 'Réactiver'}
          </button>
        </form>
      </td>
    </tr>
  `).join('');

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Activité Mon espace — Smart Kids School</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; margin: 0; padding: 24px 16px; color: #0f172a; }
    .wrap { max-width: 1280px; margin: 0 auto; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .sub { color: #64748b; font-size: 14px; margin-bottom: 24px; }
    .nav { margin-bottom: 20px; }
    .nav a { color: #232999; font-size: 13px; font-weight: 600; text-decoration: none; }
    .nav a:focus-visible, button:focus-visible, input:focus-visible { outline: 2px solid #232999; outline-offset: 2px; }
    .stats { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .stat { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; min-width: 140px; }
    .stat .n { font-size: 24px; font-weight: 700; }
    .stat .l { font-size: 12px; color: #64748b; }
    .search { display: flex; gap: 8px; margin-bottom: 16px; }
    .search input[type="text"] { flex: 1; max-width: 320px; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px; }
    .search button { padding: 8px 16px; border-radius: 8px; border: none; background: #232999; color: white; font-size: 13px; font-weight: 600; cursor: pointer; }
    .table-scroll { overflow-x: auto; border-radius: 12px; border: 1px solid #e2e8f0; }
    table { width: 100%; border-collapse: collapse; background: white; }
    th { text-align: left; padding: 10px 12px; background: #f1f5f9; font-size: 12px; text-transform: uppercase; color: #475569; white-space: nowrap; }
    tr:last-child td { border-bottom: none; }
    .empty { padding: 40px; text-align: center; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="nav"><a href="/admin?key=${encodeURIComponent(key)}">← Inscriptions</a></div>
    <h1>Activité "Mon espace"</h1>
    <p class="sub">${rows.length} compte(s)${q ? ` · recherche "${escapeHtml(q)}"` : ''}</p>

    <div class="stats">
      <div class="stat"><div class="n">${stats.total}</div><div class="l">Comptes créés</div></div>
      <div class="stat"><div class="n">${stats.subscriptionCut}</div><div class="l">Accès coupé</div></div>
      <div class="stat"><div class="n">${stats.withActivity}</div><div class="l">Au moins 1 vidéo vue</div></div>
      <div class="stat"><div class="n">${stats.withBadge}</div><div class="l">Au moins 1 badge</div></div>
      <div class="stat"><div class="n">${stats.activeLast7Days}</div><div class="l">Actifs (7 derniers jours)</div></div>
    </div>

    <form class="search" method="GET" action="/admin/espace">
      <input type="hidden" name="key" value="${escapeHtml(key)}" />
      <input type="text" name="q" value="${escapeHtml(q)}" placeholder="Chercher un email…" aria-label="Chercher un compte par email" />
      <button type="submit">Chercher</button>
      ${q ? `<a href="/admin/espace?key=${encodeURIComponent(key)}" style="align-self:center;font-size:13px;color:#64748b;text-decoration:none;">Effacer</a>` : ''}
    </form>

    ${rows.length === 0 ? '<div class="empty">Aucun compte ne correspond.</div>' : `
    <div class="table-scroll">
    <table>
      <thead>
        <tr>
          <th>Email</th><th>Vue actuelle</th><th>Abonnement</th><th>Formule</th><th>Vidéos vues</th><th>Badges</th><th>Enfants liés</th><th>Dernière activité</th><th>Action</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    </div>
    `}
  </div>
  <script>
    document.addEventListener('submit', function (e) {
      var msg = e.target.getAttribute('data-confirm');
      if (msg && !confirm(msg)) e.preventDefault();
    });
  </script>
</body>
</html>`;
}

async function buildRows(identity, q) {
  const [users, planRows] = await Promise.all([
    listAllUsers(identity),
    (async () => {
      try {
        const { sql } = getDatabase({ connectionString: process.env.NETLIFY_DB_URL });
        return await sql`
          SELECT DISTINCT ON (email) email, product_key, plan_label
          FROM enrollments
          WHERE email IS NOT NULL AND status = 'payment_confirmed'
          ORDER BY email, updated_at DESC
        `;
      } catch (err) {
        console.error('admin-espace-activity: lecture des formules échouée (non bloquante):', err.message);
        return [];
      }
    })(),
  ]);

  const planByEmail = new Map(planRows.map((r) => [String(r.email || '').toLowerCase(), r.plan_label || r.product_key]));

  const target = q.trim().toLowerCase();
  const filtered = target ? users.filter((u) => String(u.email || '').toLowerCase().includes(target)) : users;

  const rows = filtered.map((u) => {
    const meta = u.user_metadata || {};
    const progress = meta.progress || {};
    const appMeta = u.app_metadata || {};
    return {
      id: u.id,
      email: u.email,
      role: meta.role || null,
      subscriptionActive: appMeta.subscriptionActive !== false,
      planLabel: planByEmail.get(String(u.email || '').toLowerCase()) || null,
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
    subscriptionCut: rows.filter((r) => !r.subscriptionActive).length,
    withActivity: rows.filter((r) => r.watchedCount > 0).length,
    withBadge: rows.filter((r) => r.badgeCount > 0).length,
    activeLast7Days: rows.filter((r) => r.lastActivityAt && new Date(r.lastActivityAt).getTime() >= sevenDaysAgo).length,
  };

  return { rows, stats };
}

exports.handler = async (event, context) => {
  const identity = context.clientContext && context.clientContext.identity;

  if (event.httpMethod === 'POST') {
    const params = new URLSearchParams(event.body || '');
    const key = params.get('key') || '';
    const q = params.get('q') || '';

    // Vérifie la clé AVANT tout le reste : un appelant non authentifié ne
    // doit voir ni données ni message de diagnostic interne (ex: "Identity
    // indisponible"), même dans le cas pathologique où Identity serait
    // désactivé sur le site.
    if (!isValidAdminKey(key)) {
      return { statusCode: 401, body: 'Accès refusé.' };
    }
    if (!identity) {
      return { statusCode: 500, body: "Identity n'est pas disponible pour cette fonction (context.clientContext.identity manquant). Vérifiez qu'Identity est activé sur ce site." };
    }

    try {
      if (params.get('action') === 'toggle-subscription') {
        const userId = params.get('userId');
        const active = params.get('active') === 'true';
        const users = await listAllUsers(identity);
        const user = users.find((u) => u.id === userId);
        if (user) {
          await setSubscriptionActiveById(identity, userId, user.app_metadata, active);
          console.log(`Admin: accès Mon espace ${active ? 'réactivé' : 'coupé'} manuellement pour ${user.email}`);
        }
      }
    } catch (err) {
      console.error('admin-espace-activity action error:', err.message);
      return { statusCode: 500, body: 'Erreur: ' + err.message };
    }

    // Redirect/Get après le POST : évite un resoumission de formulaire si
    // l'admin recharge la page juste après une action.
    const location = `/admin/espace?key=${encodeURIComponent(key)}${q ? `&q=${encodeURIComponent(q)}` : ''}`;
    return { statusCode: 302, headers: { Location: location } };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const params = event.queryStringParameters || {};
  if (!isValidAdminKey(params.key)) {
    return { statusCode: 401, body: 'Accès refusé.' };
  }
  if (!identity) {
    return { statusCode: 500, body: "Identity n'est pas disponible pour cette fonction (context.clientContext.identity manquant). Vérifiez qu'Identity est activé sur ce site." };
  }

  try {
    const q = params.q || '';
    const { rows, stats } = await buildRows(identity, q);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: renderPage({ rows, stats, key: params.key, q }),
    };
  } catch (err) {
    console.error('admin-espace-activity error:', err.message);
    return { statusCode: 500, body: 'Erreur: ' + err.message };
  }
};
