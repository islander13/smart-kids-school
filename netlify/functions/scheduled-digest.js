// ─────────────────────────────────────────────────────────────────────────
// Netlify Function planifiée : scheduled-digest
// ─────────────────────────────────────────────────────────────────────────
// Tourne automatiquement une fois par jour (voir netlify.toml, section
// [functions."scheduled-digest"]). Deux rôles :
//
// 1. Relance des abandons : repère les formulaires remplis (status =
//    'form_submitted') depuis 2h à 7 jours sans paiement confirmé, et
//    envoie un email récapitulatif (via Netlify Forms, même mécanisme que
//    le webhook Stripe) pour pouvoir relancer ces familles manuellement.
//
// 2. Purge RGPD/LPD : supprime les inscriptions de plus de 3 ans, pour
//    respecter la durée de conservation déjà annoncée dans les mentions
//    légales ("Nom, email, téléphone — 3 ans après la dernière interaction").
// ─────────────────────────────────────────────────────────────────────────

const { getDatabase } = require('@netlify/database');

exports.handler = async () => {
  try {
    const { sql } = getDatabase({ connectionString: process.env.NETLIFY_DB_URL });

    // ─── 1. Abandons de paiement (2h à 7 jours) ───
    const abandoned = await sql`
      SELECT id, created_at, source, parent_name, email, phone, product_key
      FROM enrollments
      WHERE status = 'form_submitted'
        AND created_at < NOW() - INTERVAL '2 hours'
        AND created_at > NOW() - INTERVAL '7 days'
      ORDER BY created_at DESC
    `;

    if (abandoned.length > 0) {
      try {
        const siteUrl = process.env.SITE_URL || 'https://smartkids-school.ch';
        const summary = abandoned
          .map(r => `- ${r.parent_name || '(nom manquant)'} <${r.email || '?'}> · ${r.product_key || '?'} · ${new Date(r.created_at).toLocaleString('fr-CH')}`)
          .join('\n');

        const params = new URLSearchParams();
        params.append('form-name', 'abandoned-digest');
        params.append('count', String(abandoned.length));
        params.append('summary', summary);

        const res = await fetch(siteUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        });
        if (!res.ok) {
          console.error('Notification digest échouée, statut ' + res.status);
        }
      } catch (notifyErr) {
        console.error('Erreur notification digest (non bloquante):', notifyErr.message);
      }
    }

    console.log(`Digest: ${abandoned.length} inscription(s) non finalisée(s) entre 2h et 7 jours.`);

    // ─── 2. Purge des données de plus de 3 ans (politique de conservation) ───
    const purged = await sql`
      DELETE FROM enrollments
      WHERE created_at < NOW() - INTERVAL '3 years'
      RETURNING id
    `;
    if (purged.length > 0) {
      console.log(`Purge RGPD: ${purged.length} inscription(s) de plus de 3 ans supprimée(s).`);
    }

    return { statusCode: 200, body: JSON.stringify({ abandoned: abandoned.length, purged: purged.length }) };
  } catch (err) {
    console.error('scheduled-digest error:', err.message);
    return { statusCode: 500, body: err.message };
  }
};
