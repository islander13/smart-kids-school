// ─────────────────────────────────────────────────────────────────────────
// Netlify Function : get-link-code
// ─────────────────────────────────────────────────────────────────────────
// Renvoie le code de liaison "Mon espace" du compte APPELANT uniquement —
// aucun paramètre pour demander le code d'un autre compte, donc rien à
// abuser ici. Un parent qui veut lier le compte de son enfant doit obtenir
// ce code directement de l'enfant (affiché dans son propre "Mon espace"),
// pas juste connaître son email. Voir lib/linkCode.js pour le détail.
// ─────────────────────────────────────────────────────────────────────────

const { computeLinkCode } = require('./lib/linkCode');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'method_not_allowed' }) };
  }

  const caller = context.clientContext && context.clientContext.user;
  if (!caller) {
    return { statusCode: 401, body: JSON.stringify({ error: 'unauthorized' }) };
  }

  try {
    const code = computeLinkCode(caller.sub);
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) };
  } catch (err) {
    console.error('get-link-code error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: 'server_error' }) };
  }
};
