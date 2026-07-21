// ─────────────────────────────────────────────────────────────────────────
// Netlify Function : admin-enrollments
// ─────────────────────────────────────────────────────────────────────────
// Page interne (non listée, non indexée) pour consulter les inscriptions
// sans passer par l'éditeur SQL brut de Netlify. Protégée par une clé secrète
// dans l'URL — pas un vrai système de comptes, mais suffisant pour un usage
// interne à un seul propriétaire.
//
// Accès : https://smartkids-school.ch/admin?key=VOTRE_CLE
// (le raccourci /admin → cette fonction est défini dans public/_redirects)
//
// Configuration requise : variable d'environnement Netlify ADMIN_SECRET
// (choisissez une chaîne longue et aléatoire, marquée "Secret").
// ─────────────────────────────────────────────────────────────────────────

const { getDatabase } = require('@netlify/database');

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderPage({ rows, statusFilter, sourceFilter, stats }) {
  const statusBadge = (status) =>
    status === 'payment_confirmed'
      ? '<span style="background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:600;">payé</span>'
      : '<span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:600;">formulaire seul</span>';

  const filterLink = (label, statusVal, active) => {
    const params = new URLSearchParams();
    if (statusVal) params.set('status', statusVal);
    if (sourceFilter) params.set('source', sourceFilter);
    return `<a href="?${params.toString()}" style="padding:6px 12px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;${active ? 'background:#232999;color:white;' : 'background:#f1f5f9;color:#334155;'}">${label}</a>`;
  };

  const rowsHtml = rows.map(r => `
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 12px;white-space:nowrap;font-size:13px;color:#64748b;">${new Date(r.created_at).toLocaleString('fr-CH')}</td>
      <td style="padding:10px 12px;">${escapeHtml(r.source)}</td>
      <td style="padding:10px 12px;">${statusBadge(r.status)}</td>
      <td style="padding:10px 12px;font-weight:600;">${escapeHtml(r.parent_name)}</td>
      <td style="padding:10px 12px;"><a href="mailto:${escapeHtml(r.email)}" style="color:#232999;">${escapeHtml(r.email)}</a></td>
      <td style="padding:10px 12px;">${escapeHtml(r.phone)}</td>
      <td style="padding:10px 12px;font-size:13px;">${escapeHtml(r.product_key)}</td>
      <td style="padding:10px 12px;white-space:nowrap;">${r.amount_chf ? escapeHtml(r.amount_chf) + ' CHF' : '—'}</td>
    </tr>
  `).join('');

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Inscriptions — Smart Kids School</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; margin: 0; padding: 32px; color: #0f172a; }
    .wrap { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .sub { color: #64748b; font-size: 14px; margin-bottom: 24px; }
    .stats { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .stat { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; min-width: 140px; }
    .stat .n { font-size: 24px; font-weight: 700; }
    .stat .l { font-size: 12px; color: #64748b; }
    .filters { display: flex; gap: 8px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    th { text-align: left; padding: 10px 12px; background: #f1f5f9; font-size: 12px; text-transform: uppercase; color: #64748b; }
    tr:last-child td { border-bottom: none; }
    .empty { padding: 40px; text-align: center; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Inscriptions Smart Kids School</h1>
    <p class="sub">${rows.length} résultat(s)${statusFilter ? ` · filtré sur "${escapeHtml(statusFilter)}"` : ''}</p>

    <div class="stats">
      <div class="stat"><div class="n">${stats.total}</div><div class="l">Total</div></div>
      <div class="stat"><div class="n">${stats.confirmed}</div><div class="l">Paiements confirmés</div></div>
      <div class="stat"><div class="n">${stats.pending}</div><div class="l">Formulaire seul (non payé)</div></div>
    </div>

    <div class="filters">
      ${filterLink('Tout', '', !statusFilter)}
      ${filterLink('Payés', 'payment_confirmed', statusFilter === 'payment_confirmed')}
      ${filterLink('Non payés', 'form_submitted', statusFilter === 'form_submitted')}
    </div>

    ${rows.length === 0 ? '<div class="empty">Aucune inscription pour l\'instant.</div>' : `
    <table>
      <thead>
        <tr>
          <th>Date</th><th>Source</th><th>Statut</th><th>Parent</th><th>Email</th><th>Téléphone</th><th>Formule</th><th>Montant</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    `}
  </div>
</body>
</html>`;
}

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};

  if (!process.env.ADMIN_SECRET || params.key !== process.env.ADMIN_SECRET) {
    return { statusCode: 401, body: 'Accès refusé.' };
  }

  try {
    const { sql } = getDatabase({ connectionString: process.env.NETLIFY_DB_URL });

    const statusFilter = params.status || '';
    const sourceFilter = params.source || '';

    let rows;
    if (statusFilter && sourceFilter) {
      rows = await sql`SELECT * FROM enrollments WHERE status = ${statusFilter} AND source = ${sourceFilter} ORDER BY created_at DESC LIMIT 500`;
    } else if (statusFilter) {
      rows = await sql`SELECT * FROM enrollments WHERE status = ${statusFilter} ORDER BY created_at DESC LIMIT 500`;
    } else if (sourceFilter) {
      rows = await sql`SELECT * FROM enrollments WHERE source = ${sourceFilter} ORDER BY created_at DESC LIMIT 500`;
    } else {
      rows = await sql`SELECT * FROM enrollments ORDER BY created_at DESC LIMIT 500`;
    }

    const statsRows = await sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'payment_confirmed')::int AS confirmed,
        COUNT(*) FILTER (WHERE status = 'form_submitted')::int AS pending
      FROM enrollments
    `;
    const stats = statsRows[0];

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: renderPage({ rows, statusFilter, sourceFilter, stats }),
    };
  } catch (err) {
    console.error('admin-enrollments error:', err.message);
    return { statusCode: 500, body: 'Erreur: ' + err.message };
  }
};
