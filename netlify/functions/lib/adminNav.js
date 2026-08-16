// ─────────────────────────────────────────────────────────────────────────
// Barre d'onglets partagée entre admin-enrollments.js et admin-espace-activity.js
// — avant, un simple lien texte en haut de page ; les deux pages n'ont pas
// de composant commun (deux fonctions Netlify indépendantes qui renvoient
// chacune du HTML brut), donc ce petit générateur HTML fait office de
// "composant" réutilisé aux deux endroits.
// ─────────────────────────────────────────────────────────────────────────

const TABS_CSS = `
    .admin-tabs { display: flex; gap: 4px; margin-bottom: 20px; background: #eef0f5; padding: 4px; border-radius: 12px; width: fit-content; }
    .admin-tabs a { padding: 9px 18px; border-radius: 9px; text-decoration: none; font-size: 13px; font-weight: 600; color: #475569; }
    .admin-tabs a.active { background: #232999; color: white; }
    .admin-tabs a:not(.active):hover { background: #e2e5ee; }
    .admin-tabs a:focus-visible { outline: 2px solid #232999; outline-offset: 2px; }`;

function renderAdminTabs(activePage, key) {
  const encKey = encodeURIComponent(key);
  const tab = (page, href, label) =>
    `<a href="${href}" class="${page === activePage ? 'active' : ''}">${label}</a>`;
  return `
    <div class="admin-tabs">
      ${tab('enrollments', `/admin?key=${encKey}`, 'Inscriptions')}
      ${tab('espace', `/admin/espace?key=${encKey}`, 'Mon espace')}
      ${tab('certificates', `/admin/certificates?key=${encKey}`, 'Certificats')}
    </div>`;
}

module.exports = { TABS_CSS, renderAdminTabs };
