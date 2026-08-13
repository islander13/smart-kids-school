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
//
// Croise chaque inscription avec les comptes Identity (Mon espace) par
// email, pour repérer d'un coup d'œil qui a payé mais n'a pas encore de
// compte — et inviter en un clic (utile pour un paiement par virement,
// hors webhook Stripe).
// ─────────────────────────────────────────────────────────────────────────

const { getDatabase } = require('@netlify/database');
const { isValidAdminKey } = require('./lib/adminAuth');
const { listAllUsers, inviteUser } = require('./lib/identityUsers');

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function csvEscape(str) {
  if (str === null || str === undefined) return '';
  let s = String(str);
  // parent_name/phone/product_key viennent d'un formulaire public, donc
  // potentiellement contrôlés par un visiteur malveillant. Un champ
  // commençant par =, +, -, @ (ou tabulation/retour chariot) peut être
  // interprété comme une formule par le tableur qui ouvre ce fichier
  // (injection CSV classique) — neutralisé en forçant une valeur texte.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows) {
  const header = ['Date', 'Source', 'Statut', 'Parent', 'Email', 'Téléphone', 'Formule', 'Montant CHF', 'Client Stripe'];
  const lines = [header.map(csvEscape).join(',')];
  for (const r of rows) {
    lines.push([
      new Date(r.created_at).toISOString(),
      r.source, r.status, r.parent_name, r.email, r.phone, r.product_key,
      r.amount_chf ?? '', r.stripe_customer_id ?? '',
    ].map(csvEscape).join(','));
  }
  return lines.join('\n');
}

function renderPage({ rows, statusFilter, sourceFilter, q, stats, key }) {
  const statusBadge = (status) =>
    status === 'payment_confirmed'
      ? '<span style="background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:600;">payé</span>'
      : '<span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:600;">formulaire seul</span>';

  // Repris dans chaque form ci-dessous (champs cachés) pour revenir sur la
  // même vue filtrée/recherchée après une action, plutôt que de repartir de
  // "Tout" à chaque fois.
  const stateFields = `
          <input type="hidden" name="status" value="${escapeHtml(statusFilter)}" />
          <input type="hidden" name="source" value="${escapeHtml(sourceFilter)}" />
          <input type="hidden" name="q" value="${escapeHtml(q)}" />`;

  const espaceCell = (r) => {
    if (!r.hasEspaceAccount) {
      if (r.status !== 'payment_confirmed' || !r.email) return '<span style="color:#94a3b8;font-size:12px;">—</span>';
      return `
        <form method="POST" style="margin:0;" data-confirm="Inviter ${escapeHtml(r.email)} à Mon espace ?">
          <input type="hidden" name="key" value="${escapeHtml(key)}" />
          <input type="hidden" name="action" value="invite" />
          <input type="hidden" name="email" value="${escapeHtml(r.email)}" />${stateFields}
          <button type="submit" style="padding:4px 9px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid #c7d2fe;background:#eef2ff;color:#3730a3;white-space:nowrap;">Inviter</button>
        </form>`;
    }
    return r.espaceSubscriptionActive
      ? '<span style="background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap;">compte actif</span>'
      : '<span style="background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap;">accès coupé</span>';
  };

  // Confirmation renforcée pour une ligne payée : elle est soumise à
  // l'obligation de conservation de 10 ans (voir scheduled-digest.js), donc
  // la supprimer à la main devrait rester l'exception (doublon, ligne de
  // test, erreur manifeste) — pas un geste anodin comme pour un simple
  // formulaire jamais payé.
  const deleteCell = (r) => {
    const confirmMsg = r.status === 'payment_confirmed'
      ? `⚠️ Ce paiement est CONFIRMÉ (${escapeHtml(r.parent_name) || escapeHtml(r.email)}). Le supprimer est définitif et peut entrer en conflit avec l'obligation de conservation de 10 ans. Continuer ?`
      : `Supprimer cette inscription (${escapeHtml(r.parent_name) || escapeHtml(r.email) || 'sans nom'}) ? Définitif.`;
    return `
      <form method="POST" style="margin:0;" data-confirm="${confirmMsg}">
        <input type="hidden" name="key" value="${escapeHtml(key)}" />
        <input type="hidden" name="action" value="delete" />
        <input type="hidden" name="id" value="${escapeHtml(r.id)}" />${stateFields}
        <button type="submit" style="padding:4px 9px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid #fecaca;background:#fef2f2;color:#991b1b;white-space:nowrap;">Supprimer</button>
      </form>`;
  };

  const filterLink = (label, statusVal, active) => {
    const params = new URLSearchParams();
    params.set('key', key);
    if (statusVal) params.set('status', statusVal);
    if (sourceFilter) params.set('source', sourceFilter);
    if (q) params.set('q', q);
    return `<a href="?${params.toString()}" style="padding:6px 12px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;${active ? 'background:#232999;color:white;' : 'background:#f1f5f9;color:#334155;'}">${label}</a>`;
  };

  const csvParams = new URLSearchParams();
  csvParams.set('key', key);
  csvParams.set('format', 'csv');
  if (statusFilter) csvParams.set('status', statusFilter);
  if (sourceFilter) csvParams.set('source', sourceFilter);
  if (q) csvParams.set('q', q);

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
      <td style="padding:10px 12px;white-space:nowrap;">${r.stripe_customer_id ? `<a href="https://dashboard.stripe.com/search?query=${encodeURIComponent(r.stripe_customer_id)}" target="_blank" rel="noopener noreferrer" style="color:#232999;font-size:12px;">Stripe ↗</a>` : '<span style="color:#94a3b8;">—</span>'}</td>
      <td style="padding:10px 12px;">${espaceCell(r)}</td>
      <td style="padding:10px 12px;">${deleteCell(r)}</td>
    </tr>
  `).join('');

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Inscriptions — Smart Kids School</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; margin: 0; padding: 24px 16px; color: #0f172a; }
    .wrap { max-width: 1360px; margin: 0 auto; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .sub { color: #64748b; font-size: 14px; margin-bottom: 24px; }
    .nav { margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
    .nav a { color: #232999; font-size: 13px; font-weight: 600; text-decoration: none; }
    .nav a:focus-visible, button:focus-visible, input:focus-visible { outline: 2px solid #232999; outline-offset: 2px; }
    .stats { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .stat { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; min-width: 140px; }
    .stat .n { font-size: 24px; font-weight: 700; }
    .stat .l { font-size: 12px; color: #64748b; }
    .toolbar { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
    .filters { display: flex; gap: 8px; flex-wrap: wrap; }
    .search { display: flex; gap: 8px; }
    .search input[type="text"] { padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px; min-width: 200px; }
    .search button, .csv-link { padding: 8px 16px; border-radius: 8px; border: none; background: #232999; color: white; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; }
    .table-scroll { overflow-x: auto; border-radius: 12px; border: 1px solid #e2e8f0; }
    table { width: 100%; border-collapse: collapse; background: white; }
    th { text-align: left; padding: 10px 12px; background: #f1f5f9; font-size: 12px; text-transform: uppercase; color: #64748b; white-space: nowrap; }
    tr:last-child td { border-bottom: none; }
    .empty { padding: 40px; text-align: center; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="nav">
      <a href="/admin/espace?key=${encodeURIComponent(key)}">Activité "Mon espace" →</a>
      <a class="csv-link" href="?${csvParams.toString()}">Exporter en CSV</a>
    </div>
    <h1>Inscriptions Smart Kids School</h1>
    <p class="sub">${rows.length} résultat(s)${statusFilter ? ` · filtré sur "${escapeHtml(statusFilter)}"` : ''}${q ? ` · recherche "${escapeHtml(q)}"` : ''}</p>

    <div class="stats">
      <div class="stat"><div class="n">${stats.total}</div><div class="l">Total</div></div>
      <div class="stat"><div class="n">${stats.confirmed}</div><div class="l">Paiements confirmés</div></div>
      <div class="stat"><div class="n">${stats.pending}</div><div class="l">Formulaire seul (non payé)</div></div>
      <div class="stat"><div class="n">${stats.confirmedWithoutAccount}</div><div class="l">Payé, sans compte Mon espace</div></div>
    </div>

    <div class="toolbar">
      <div class="filters">
        ${filterLink('Tout', '', !statusFilter)}
        ${filterLink('Payés', 'payment_confirmed', statusFilter === 'payment_confirmed')}
        ${filterLink('Non payés', 'form_submitted', statusFilter === 'form_submitted')}
      </div>
      <form class="search" method="GET" action="/admin">
        <input type="hidden" name="key" value="${escapeHtml(key)}" />
        ${statusFilter ? `<input type="hidden" name="status" value="${escapeHtml(statusFilter)}" />` : ''}
        <input type="text" name="q" value="${escapeHtml(q)}" placeholder="Chercher nom ou email…" aria-label="Chercher par nom ou email" />
        <button type="submit">Chercher</button>
      </form>
    </div>

    ${rows.length === 0 ? '<div class="empty">Aucune inscription ne correspond.</div>' : `
    <div class="table-scroll">
    <table>
      <thead>
        <tr>
          <th>Date</th><th>Source</th><th>Statut</th><th>Parent</th><th>Email</th><th>Téléphone</th><th>Formule</th><th>Montant</th><th>Stripe</th><th>Mon espace</th><th></th>
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

async function fetchRows({ statusFilter, sourceFilter, q }) {
  const { sql } = getDatabase({ connectionString: process.env.NETLIFY_DB_URL });
  const likeQ = q ? `%${q}%` : null;

  // sql-template ne supporte pas de clauses WHERE construites dynamiquement
  // avec un nombre variable de conditions : on énumère les combinaisons,
  // comme le faisait déjà ce fichier pour statusFilter/sourceFilter.
  if (statusFilter && sourceFilter && likeQ) {
    return sql`SELECT * FROM enrollments WHERE status = ${statusFilter} AND source = ${sourceFilter} AND (parent_name ILIKE ${likeQ} OR email ILIKE ${likeQ}) ORDER BY created_at DESC LIMIT 500`;
  }
  if (statusFilter && likeQ) {
    return sql`SELECT * FROM enrollments WHERE status = ${statusFilter} AND (parent_name ILIKE ${likeQ} OR email ILIKE ${likeQ}) ORDER BY created_at DESC LIMIT 500`;
  }
  if (sourceFilter && likeQ) {
    return sql`SELECT * FROM enrollments WHERE source = ${sourceFilter} AND (parent_name ILIKE ${likeQ} OR email ILIKE ${likeQ}) ORDER BY created_at DESC LIMIT 500`;
  }
  if (likeQ) {
    return sql`SELECT * FROM enrollments WHERE (parent_name ILIKE ${likeQ} OR email ILIKE ${likeQ}) ORDER BY created_at DESC LIMIT 500`;
  }
  if (statusFilter && sourceFilter) {
    return sql`SELECT * FROM enrollments WHERE status = ${statusFilter} AND source = ${sourceFilter} ORDER BY created_at DESC LIMIT 500`;
  }
  if (statusFilter) {
    return sql`SELECT * FROM enrollments WHERE status = ${statusFilter} ORDER BY created_at DESC LIMIT 500`;
  }
  if (sourceFilter) {
    return sql`SELECT * FROM enrollments WHERE source = ${sourceFilter} ORDER BY created_at DESC LIMIT 500`;
  }
  return sql`SELECT * FROM enrollments ORDER BY created_at DESC LIMIT 500`;
}

exports.handler = async (event, context) => {
  const identity = context.clientContext && context.clientContext.identity;

  if (event.httpMethod === 'POST') {
    const params = new URLSearchParams(event.body || '');
    const key = params.get('key') || '';
    if (!isValidAdminKey(key)) {
      return { statusCode: 401, body: 'Accès refusé.' };
    }
    try {
      if (params.get('action') === 'invite') {
        if (!identity) {
          console.warn('admin-enrollments: invitation ignorée, Identity indisponible pour cette invocation.');
        } else {
          const email = params.get('email');
          if (email) {
            const { invited } = await inviteUser(identity, email);
            console.log(`Admin: invitation Mon espace ${invited ? 'envoyée' : 'déjà existante'} pour ${email}`);
          }
        }
      } else if (params.get('action') === 'delete') {
        const id = Number(params.get('id'));
        if (Number.isInteger(id)) {
          const { sql } = getDatabase({ connectionString: process.env.NETLIFY_DB_URL });
          const deleted = await sql`DELETE FROM enrollments WHERE id = ${id} RETURNING email, status`;
          if (deleted.length > 0) {
            console.log(`Admin: inscription #${id} supprimée manuellement (${deleted[0].email || 'sans email'}, statut ${deleted[0].status}).`);
          }
        }
      }
    } catch (err) {
      console.error('admin-enrollments action error:', err.message);
      return { statusCode: 500, body: 'Erreur: ' + err.message };
    }

    // Revient sur la même vue filtrée/recherchée plutôt que de repartir de "Tout".
    const redirectParams = new URLSearchParams({ key });
    if (params.get('status')) redirectParams.set('status', params.get('status'));
    if (params.get('source')) redirectParams.set('source', params.get('source'));
    if (params.get('q')) redirectParams.set('q', params.get('q'));
    return { statusCode: 302, headers: { Location: `/admin?${redirectParams.toString()}` } };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const params = event.queryStringParameters || {};
  if (!isValidAdminKey(params.key)) {
    return { statusCode: 401, body: 'Accès refusé.' };
  }

  try {
    const statusFilter = params.status || '';
    const sourceFilter = params.source || '';
    const q = params.q || '';

    const rows = await fetchRows({ statusFilter, sourceFilter, q });

    if (params.format === 'csv') {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="inscriptions-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
        body: toCsv(rows),
      };
    }

    // Croisement avec les comptes Identity : best-effort, n'empêche jamais
    // d'afficher les inscriptions si Identity est momentanément indisponible.
    let espaceByEmail = new Map();
    if (identity) {
      try {
        const users = await listAllUsers(identity);
        espaceByEmail = new Map(users.map((u) => [
          String(u.email || '').toLowerCase(),
          (u.app_metadata || {}).subscriptionActive !== false,
        ]));
      } catch (err) {
        console.error('admin-enrollments: lecture des comptes Identity échouée (non bloquante):', err.message);
      }
    }

    const enrichedRows = rows.map((r) => {
      const hasEspaceAccount = r.email ? espaceByEmail.has(String(r.email).toLowerCase()) : false;
      return {
        ...r,
        hasEspaceAccount,
        espaceSubscriptionActive: hasEspaceAccount ? espaceByEmail.get(String(r.email).toLowerCase()) : null,
      };
    });

    // Comptes globaux (pas limités par les filtres/recherche courants), comme
    // total/confirmed/pending ci-dessous — sans ça, "payé sans compte" se
    // mettrait à zéro dès qu'on filtre sur autre chose que "Payés".
    const { sql } = getDatabase({ connectionString: process.env.NETLIFY_DB_URL });
    const [statsRow, confirmedEmailRows] = await Promise.all([
      sql`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE status = 'payment_confirmed')::int AS confirmed,
          COUNT(*) FILTER (WHERE status = 'form_submitted')::int AS pending
        FROM enrollments
      `,
      sql`SELECT DISTINCT email FROM enrollments WHERE status = 'payment_confirmed' AND email IS NOT NULL`,
    ]);
    const confirmedWithoutAccount = confirmedEmailRows.filter(
      (r) => !espaceByEmail.has(String(r.email).toLowerCase())
    ).length;
    const stats = { ...statsRow[0], confirmedWithoutAccount };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: renderPage({ rows: enrichedRows, statusFilter, sourceFilter, q, stats, key: params.key }),
    };
  } catch (err) {
    console.error('admin-enrollments error:', err.message);
    return { statusCode: 500, body: 'Erreur: ' + err.message };
  }
};
