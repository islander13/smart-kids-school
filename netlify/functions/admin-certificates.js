// ─────────────────────────────────────────────────────────────────────────
// Netlify Function : admin-certificates
// ─────────────────────────────────────────────────────────────────────────
// Génère et suit les certificats de réussite ("Mon espace") : un
// enregistrement en base par certificat (qui, quel cours, quand), avec un
// lien "Ouvrir" qui pré-remplit public/sks-certificate.html (le générateur
// visuel, 100% client, déjà existant) pour le télécharger en PNG/PDF —
// aucun fichier n'est jamais stocké côté serveur, juste les paramètres.
//
// Deux vues :
//   /admin/certificates?key=...            → recherche un compte par email
//                                             + liste globale des derniers
//                                             certificats générés
//   /admin/certificates?key=...&user=<id>  → historique + génération pour
//                                             CE compte précis
//
// Même protection que admin-enrollments.js / admin-espace-activity.js (clé
// secrète dans l'URL, ADMIN_SECRET).
// ─────────────────────────────────────────────────────────────────────────

const { getDatabase } = require('@netlify/database');
const { isValidAdminKey } = require('./lib/adminAuth');
const { findUserByEmail, getUserById } = require('./lib/identityUsers');
const { TABS_CSS, renderAdminTabs } = require('./lib/adminNav');
const { COURSES, LANGS, toDateStr, buildCertOpenUrl: certLink } = require('./lib/certificateCourses');

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isValidDate(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')) && !isNaN(new Date(s + 'T00:00:00').getTime());
}

function certRow(cert, key, { showAccount, back, isNew }) {
  return `
    <tr style="border-bottom:1px solid #e2e8f0;${isNew ? 'background:#eef0fb;' : ''}">
      <td style="padding:10px 12px;white-space:nowrap;font-size:13px;color:#64748b;">${new Date(cert.created_at).toLocaleDateString('fr-CH')}${isNew ? ' <span style="background:#232999;color:white;padding:1px 7px;border-radius:999px;font-size:11px;font-weight:700;margin-left:4px;">nouveau</span>' : ''}</td>
      ${showAccount ? `<td style="padding:10px 12px;"><a href="/admin/certificates?key=${encodeURIComponent(key)}&user=${encodeURIComponent(cert.user_id)}" style="color:#232999;">${escapeHtml(cert.user_email)}</a></td>` : ''}
      <td style="padding:10px 12px;font-weight:600;">${escapeHtml(cert.student_name)}</td>
      <td style="padding:10px 12px;font-size:13px;">${escapeHtml(COURSES[cert.course_key] || cert.course_key)}</td>
      <td style="padding:10px 12px;font-size:13px;">${escapeHtml(LANGS[cert.lang] || cert.lang)}</td>
      <td style="padding:10px 12px;white-space:nowrap;font-size:13px;color:#64748b;">${toDateStr(cert.issued_date)}</td>
      <td style="padding:10px 12px;white-space:nowrap;">
        <a href="${escapeHtml(certLink(cert))}" target="_blank" rel="noopener" style="padding:5px 10px;border-radius:8px;font-size:12px;font-weight:600;border:none;background:#e0e7ff;color:#232999;text-decoration:none;display:inline-block;">Ouvrir ↗</a>
        <form method="POST" style="display:inline;margin:0 0 0 6px;" data-confirm="Supprimer ce certificat (${escapeHtml(cert.student_name)} — ${escapeHtml(COURSES[cert.course_key] || cert.course_key)}) ? Cette action est définitive.">
          <input type="hidden" name="key" value="${escapeHtml(key)}" />
          <input type="hidden" name="action" value="delete" />
          <input type="hidden" name="certId" value="${escapeHtml(cert.id)}" />
          <input type="hidden" name="user" value="${escapeHtml(cert.user_id)}" />
          <input type="hidden" name="back" value="${escapeHtml(back)}" />
          <button type="submit" style="padding:5px 10px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid #fecaca;background:#fef2f2;color:#991b1b;">Supprimer</button>
        </form>
      </td>
    </tr>`;
}

function renderPage({ key, targetUserId, targetEmail, accountError, certsForUser, defaultStudentName, justCreatedId, globalCerts, globalStats, q }) {
  const today = new Date().toISOString().slice(0, 10);
  const accountBack = `/admin/certificates?key=${encodeURIComponent(key)}&user=${encodeURIComponent(targetUserId || '')}`;

  const courseOptions = Object.entries(COURSES).map(([k, l]) => `<option value="${k}">${escapeHtml(l)}</option>`).join('');
  const langOptions = Object.entries(LANGS).map(([k, l]) => `<option value="${k}"${k === 'fr' ? ' selected' : ''}>${escapeHtml(l)}</option>`).join('');

  const accountPanel = targetUserId ? `
    <div class="card gen-card">
      <h2>Générer un certificat pour <span style="color:#232999;">${escapeHtml(targetEmail)}</span></h2>
      <form method="POST" class="gen-form">
        <input type="hidden" name="key" value="${escapeHtml(key)}" />
        <input type="hidden" name="action" value="generate" />
        <input type="hidden" name="user" value="${escapeHtml(targetUserId)}" />
        <input type="hidden" name="email" value="${escapeHtml(targetEmail)}" />
        <label>Nom de l'élève
          <input type="text" name="studentName" required placeholder="ex. Emma Dupont" value="${escapeHtml(defaultStudentName)}" />
        </label>
        <label>Cours
          <select name="courseKey">${courseOptions}</select>
        </label>
        <label>Langue
          <select name="lang">${langOptions}</select>
        </label>
        <label>Date
          <input type="date" name="issuedDate" value="${today}" required />
        </label>
        <button type="submit">Générer</button>
      </form>
      ${defaultStudentName ? `<p class="hint" style="margin:10px 0 0;">Nom pré-rempli depuis l'inscription (nom du parent) — à corriger si c'est le prénom de l'enfant qui doit apparaître.</p>` : ''}
    </div>

    <h2 class="hist-title">Historique (${certsForUser.length})</h2>
    ${certsForUser.length === 0 ? '<div class="empty">Aucun certificat généré pour ce compte pour l\'instant.</div>' : `
    <div class="table-scroll">
      <table>
        <thead><tr><th>Généré le</th><th>Nom</th><th>Cours</th><th>Langue</th><th>Date du certificat</th><th>Action</th></tr></thead>
        <tbody>${certsForUser.map((c) => certRow(c, key, { showAccount: false, back: accountBack, isNew: String(c.id) === String(justCreatedId) })).join('')}</tbody>
      </table>
    </div>`}
    <p class="back-link"><a href="/admin/certificates?key=${encodeURIComponent(key)}">← Chercher un autre compte</a></p>
  ` : `
    ${accountError ? `<div class="alert">${escapeHtml(accountError)}</div>` : ''}
    <div class="card">
      <h2>Générer un certificat</h2>
      <p class="hint">Le compte doit déjà exister dans "Mon espace" — cherchez-le par email pour ouvrir son historique et générer un certificat.</p>
      <form method="GET" action="/admin/certificates" class="find-form">
        <input type="hidden" name="key" value="${escapeHtml(key)}" />
        <input type="email" name="email" placeholder="email du compte…" required aria-label="Email du compte pour générer un certificat" />
        <button type="submit">Chercher ce compte</button>
      </form>
    </div>

    <div class="stats">
      <div class="stat"><div class="n">${globalStats.total}</div><div class="l">Certificats générés</div></div>
      <div class="stat"><div class="n">${globalStats.accounts}</div><div class="l">Comptes concernés</div></div>
    </div>

    <h2 class="hist-title">Tous les certificats</h2>
    <form class="search" method="GET" action="/admin/certificates">
      <input type="hidden" name="key" value="${escapeHtml(key)}" />
      <input type="text" name="q" value="${escapeHtml(q)}" placeholder="Filtrer par email…" aria-label="Filtrer les certificats par email de compte" />
      <button type="submit">Filtrer</button>
      ${q ? `<a href="/admin/certificates?key=${encodeURIComponent(key)}" class="clear-link">Effacer</a>` : ''}
    </form>
    ${globalCerts.length === 0 ? '<div class="empty">Aucun certificat ne correspond.</div>' : `
    <div class="table-scroll">
      <table>
        <thead><tr><th>Généré le</th><th>Compte</th><th>Nom</th><th>Cours</th><th>Langue</th><th>Date du certificat</th><th>Action</th></tr></thead>
        <tbody>${globalCerts.map((c) => certRow(c, key, { showAccount: true, back: `/admin/certificates?key=${encodeURIComponent(key)}${q ? `&q=${encodeURIComponent(q)}` : ''}`, isNew: false })).join('')}</tbody>
      </table>
    </div>`}
  `;

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Certificats — Smart Kids School</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; margin: 0; padding: 24px 16px; color: #0f172a; }
    .wrap { max-width: 1280px; margin: 0 auto; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .sub { color: #64748b; font-size: 14px; margin-bottom: 24px; }
    button:focus-visible, input:focus-visible, select:focus-visible, a:focus-visible { outline: 2px solid #232999; outline-offset: 2px; }
${TABS_CSS}
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin-bottom: 20px; }
    .card h2 { font-size: 16px; margin: 0 0 6px; }
    .card .hint { font-size: 13px; color: #64748b; margin: 0 0 14px; }
    .gen-card h2 { margin-bottom: 14px; }
    .gen-form { display: flex; flex-wrap: wrap; gap: 14px 16px; align-items: flex-end; }
    .gen-form label { display: flex; flex-direction: column; gap: 5px; font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: .02em; }
    .gen-form input, .gen-form select { font-family: inherit; font-size: 14px; font-weight: 400; text-transform: none; letter-spacing: normal; color: #0f172a; padding: 8px 10px; border-radius: 8px; border: 1px solid #cbd5e1; }
    .gen-form input[type="text"] { min-width: 200px; }
    .gen-form button { padding: 9px 18px; border-radius: 8px; border: none; background: #232999; color: white; font-size: 13px; font-weight: 600; cursor: pointer; align-self: flex-end; }
    .find-form { display: flex; gap: 8px; }
    .find-form input { flex: 1; max-width: 320px; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px; }
    .find-form button { padding: 8px 16px; border-radius: 8px; border: none; background: #232999; color: white; font-size: 13px; font-weight: 600; cursor: pointer; }
    .alert { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 10px; padding: 12px 16px; font-size: 14px; margin-bottom: 20px; }
    .stats { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .stat { background: white; border: 2px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; min-width: 140px; }
    .stat .n { font-size: 24px; font-weight: 700; color: #0f172a; }
    .stat .l { font-size: 12px; color: #64748b; }
    .hist-title { font-size: 15px; margin: 0 0 12px; color: #334155; }
    .search { display: flex; gap: 8px; margin-bottom: 16px; }
    .search input[type="text"] { flex: 1; max-width: 320px; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px; }
    .search button { padding: 8px 16px; border-radius: 8px; border: none; background: #232999; color: white; font-size: 13px; font-weight: 600; cursor: pointer; }
    .clear-link { align-self: center; font-size: 13px; color: #64748b; text-decoration: none; }
    .table-scroll { overflow-x: auto; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; background: white; }
    th { text-align: left; padding: 10px 12px; background: #f1f5f9; font-size: 12px; text-transform: uppercase; color: #475569; white-space: nowrap; }
    tr:last-child td { border-bottom: none; }
    .empty { padding: 40px; text-align: center; color: #94a3b8; margin-bottom: 24px; }
    .back-link { font-size: 13px; }
    .back-link a { color: #232999; }
  </style>
</head>
<body>
  <div class="wrap">
    ${renderAdminTabs('certificates', key)}
    <h1>Certificats</h1>
    <p class="sub">Génère les certificats de réussite (PDF/PNG) directement pour un compte "Mon espace", avec historique et suppression en cas d'erreur.</p>
    ${accountPanel}
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

exports.handler = async (event, context) => {
  const identity = context.clientContext && context.clientContext.identity;

  if (event.httpMethod === 'POST') {
    const params = new URLSearchParams(event.body || '');
    const key = params.get('key') || '';

    if (!isValidAdminKey(key)) {
      return { statusCode: 401, body: 'Accès refusé.' };
    }
    if (!identity) {
      return { statusCode: 500, body: "Identity n'est pas disponible pour cette fonction (context.clientContext.identity manquant). Vérifiez qu'Identity est activé sur ce site." };
    }

    const action = params.get('action');
    const userId = params.get('user') || '';
    // Emporté par les boutons "Supprimer" pour revenir là où l'admin était
    // (vue compte ou vue globale, filtre compris) plutôt que d'atterrir
    // systématiquement sur la vue compte — restreint au chemin attendu pour
    // qu'un formulaire trafiqué ne puisse pas servir de redirection ouverte.
    const back = params.get('back') || '';
    const safeBack = back.startsWith('/admin/certificates?') ? back : '';

    let newCertId = '';

    try {
      const { sql } = getDatabase({ connectionString: process.env.NETLIFY_DB_URL });

      if (action === 'generate') {
        const email = params.get('email') || '';
        const studentName = (params.get('studentName') || '').trim();
        const courseKey = params.get('courseKey') || '';
        const lang = params.get('lang') || 'fr';
        const issuedDate = params.get('issuedDate') || '';

        if (!userId || !email || !studentName || !COURSES[courseKey] || !LANGS[lang] || !isValidDate(issuedDate)) {
          return { statusCode: 400, body: 'Champs invalides — vérifiez le nom, le cours, la langue et la date.' };
        }

        const inserted = await sql`
          INSERT INTO certificates (user_id, user_email, student_name, course_key, lang, issued_date)
          VALUES (${userId}, ${email}, ${studentName}, ${courseKey}, ${lang}, ${issuedDate})
          RETURNING id
        `;
        newCertId = inserted[0] ? String(inserted[0].id) : '';
        console.log(`Admin: certificat généré pour ${email} (${courseKey}, ${lang})`);
      } else if (action === 'delete') {
        const certId = params.get('certId');
        if (certId && userId) {
          // Portée par user_id en plus de l'id (déjà unique) : défense en
          // profondeur, un formulaire trafiqué ne peut pas viser le
          // certificat d'un autre compte que celui déclaré.
          await sql`DELETE FROM certificates WHERE id = ${certId} AND user_id = ${userId}`;
        }
      }
    } catch (err) {
      console.error('admin-certificates action error:', err.message);
      return { statusCode: 500, body: 'Erreur: ' + err.message };
    }

    const location = safeBack
      ? safeBack
      : `/admin/certificates?key=${encodeURIComponent(key)}${userId ? `&user=${encodeURIComponent(userId)}` : ''}${newCertId ? `&justCreated=${encodeURIComponent(newCertId)}` : ''}`;
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
    const { sql } = getDatabase({ connectionString: process.env.NETLIFY_DB_URL });

    // Recherche par email (depuis le petit formulaire "Générer pour ce
    // compte") : redirige vers la vue par user id dès qu'un compte est
    // trouvé, pour que l'URL reste bookmarkable et cohérente avec le lien
    // envoyé depuis /admin/espace.
    if (!params.user && params.email) {
      const found = await findUserByEmail(identity, params.email);
      if (found) {
        return { statusCode: 302, headers: { Location: `/admin/certificates?key=${encodeURIComponent(params.key)}&user=${encodeURIComponent(found.id)}` } };
      }
      const { rows, stats } = await buildGlobalView(sql, '');
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        body: renderPage({
          key: params.key,
          targetUserId: '',
          targetEmail: '',
          accountError: `Aucun compte "Mon espace" avec l'email "${params.email}" — le compte doit déjà exister avant de générer un certificat.`,
          certsForUser: [],
          defaultStudentName: '',
          justCreatedId: '',
          globalCerts: rows,
          globalStats: stats,
          q: '',
        }),
      };
    }

    let targetUserId = params.user || '';
    let targetEmail = '';
    let accountError = '';

    if (targetUserId) {
      const user = await getUserById(identity, targetUserId);
      if (!user) {
        accountError = 'Ce compte est introuvable (peut-être supprimé depuis).';
        targetUserId = '';
      } else {
        targetEmail = user.email;
      }
    }

    if (targetUserId) {
      const [certsForUser, defaultNameRows] = await Promise.all([
        sql`SELECT * FROM certificates WHERE user_id = ${targetUserId} ORDER BY created_at DESC`,
        // Meilleure estimation du nom à pré-remplir : le nom du parent fourni
        // à l'inscription. Reste éditable — l'admin corrige pour le prénom
        // de l'enfant si besoin.
        sql`SELECT parent_name FROM enrollments WHERE email = ${targetEmail} AND parent_name IS NOT NULL ORDER BY updated_at DESC LIMIT 1`,
      ]);
      const defaultStudentName = (defaultNameRows[0] && defaultNameRows[0].parent_name) || '';
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        body: renderPage({ key: params.key, targetUserId, targetEmail, accountError: '', certsForUser, defaultStudentName, justCreatedId: params.justCreated || '', globalCerts: [], globalStats: { total: 0, accounts: 0 }, q: '' }),
      };
    }

    const q = (params.q || '').trim();
    const { rows, stats } = await buildGlobalView(sql, q);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: renderPage({ key: params.key, targetUserId: '', targetEmail: '', accountError, certsForUser: [], defaultStudentName: '', justCreatedId: '', globalCerts: rows, globalStats: stats, q }),
    };
  } catch (err) {
    console.error('admin-certificates error:', err.message);
    return { statusCode: 500, body: 'Erreur: ' + err.message };
  }
};

async function buildGlobalView(sql, q) {
  const [rows, statsRows] = await Promise.all([
    q
      ? sql`SELECT * FROM certificates WHERE user_email ILIKE ${'%' + q + '%'} ORDER BY created_at DESC LIMIT 200`
      : sql`SELECT * FROM certificates ORDER BY created_at DESC LIMIT 200`,
    sql`SELECT COUNT(*)::int AS total, COUNT(DISTINCT user_id)::int AS accounts FROM certificates`,
  ]);
  const stats = statsRows[0] || { total: 0, accounts: 0 };
  return { rows, stats };
}
