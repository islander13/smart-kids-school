// ─────────────────────────────────────────────────────────────────────────
// Netlify Function : stripe-webhook
// ─────────────────────────────────────────────────────────────────────────
// Reçoit les événements envoyés DIRECTEMENT par Stripe (pas par le navigateur
// du client). Contrairement à la redirection vers /merci, cet appel a lieu
// même si le client ferme son onglet juste après avoir payé — c'est le seul
// signal fiable à 100% qu'un paiement a réellement abouti.
//
// Configuration requise dans Stripe (Developers → Webhooks → Add endpoint) :
//   URL         : https://smartkids-school.ch/.netlify/functions/stripe-webhook
//   Événements  : checkout.session.completed
// Stripe fournit alors un "Signing secret" (whsec_...) à coller dans les
// variables d'environnement Netlify sous STRIPE_WEBHOOK_SECRET.
// ─────────────────────────────────────────────────────────────────────────

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { getDatabase } = require('@netlify/database');
const { createDownloadToken } = require('./lib/downloadToken');

function sourceFromProductKey(productKey) {
  if (!productKey) return 'tarifs';
  if (productKey.startsWith('stage-')) return 'stages';
  if (productKey.startsWith('premium-')) return 'premium';
  return 'tarifs';
}

// Crée (ou invite) le compte "Mon espace" du client juste après un paiement
// réel — c'est ce qui remplace l'inscription libre : personne ne peut plus
// se créer un compte tout seul (voir Site settings → Identity → Registration
// → "Invite only" côté dashboard Netlify, seule action encore manuelle), et
// un client qui paie reçoit automatiquement l'email d'invitation Identity
// standard, sans intervention manuelle de l'école.
//
// context.clientContext.identity ({ url, token }) donne un accès admin à
// l'API Identity du site sur CHAQUE invocation de fonction, dès qu'Identity
// est activé — même mécanisme déjà utilisé par link-child.js et
// admin-espace-activity.js, aucune variable d'environnement à ajouter.
async function inviteEspaceAccount(identity, email) {
  if (!identity || !email) {
    console.warn(`Invitation "Mon espace" ignorée : identity ou email manquant (email=${email || 'absent'}).`);
    return;
  }
  try {
    const res = await fetch(`${identity.url}/admin/users`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${identity.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      console.log(`Invitation "Mon espace" envoyée à ${email}`);
      return;
    }
    const body = await res.json().catch(() => ({}));
    const alreadyExists = res.status === 422 && /already been registered|already exists/i.test(body.msg || body.error_description || '');
    if (alreadyExists) {
      // Cas normal : un client qui se réinscrit (2e année, stage après
      // l'abonnement annuel...) a déjà un compte Identity. Rien à faire.
      return;
    }
    console.error(`Invitation "Mon espace" échouée pour ${email} (statut ${res.status}):`, body.msg || body.error_description || JSON.stringify(body));
  } catch (err) {
    // Ne fait jamais échouer le webhook pour un problème d'invitation : le
    // paiement est déjà confirmé et loggé, c'est l'essentiel. L'école peut
    // toujours inviter la personne manuellement depuis le dashboard Identity.
    console.error(`Erreur invitation "Mon espace" pour ${email} (non bloquante):`, err.message);
  }
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const signature = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64')
    : event.body;

  let stripeEvent;
  try {
    // Vérifie que l'appel vient bien de Stripe (empêche quiconque de
    // fabriquer un faux événement "paiement réussi").
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature invalide:', err.message);
    return { statusCode: 400, body: `Webhook signature invalide: ${err.message}` };
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;

    // Trace fiable et permanente dans les logs Netlify (Functions → stripe-webhook)
    // : même si tout le reste échoue, la preuve du paiement existe ici. Limité
    // au strict nécessaire pour la réconciliation (qui a payé quoi, combien) —
    // pas le nom/âge de l'enfant, le téléphone ni les objectifs en texte libre
    // (déjà dans Stripe et dans la table enrollments quand l'écriture réussit,
    // inutile de les dupliquer dans les logs).
    console.log('✅ Paiement confirmé par Stripe:', JSON.stringify({
      sessionId: session.id,
      email: session.customer_email || session.customer_details?.email,
      amountTotal: session.amount_total ? session.amount_total / 100 : null,
      currency: session.currency,
      productKey: session.metadata?.productKey,
    }, null, 2));

    const isShopOrder = session.metadata?.type === 'shop';

    if (isShopOrder) {
      // ─── Commande boutique (ebook...) : table shop_orders + jeton de
      // téléchargement, séparé du flux enrollments ci-dessous. ───
      const email = session.customer_email || session.customer_details?.email || null;
      const amount = session.amount_total ? session.amount_total / 100 : null;
      const productKey = session.metadata?.productKey || null;

      // Stripe peut renvoyer le même événement plusieurs fois (timeout, 5xx
      // transitoire, "resend" manuel depuis le dashboard) — un cas normal,
      // pas une erreur. Si la commande est déjà confirmée, on réutilise son
      // jeton de téléchargement existant au lieu d'en générer un nouveau :
      // sinon, le nouveau jeton écrase l'ancien en base et invalide
      // silencieusement le lien déjà envoyé par email au client.
      let wasAlreadyConfirmed = false;
      let token, expiresAt;
      try {
        const { sql } = getDatabase({ connectionString: process.env.NETLIFY_DB_URL });
        const existing = await sql`SELECT status, download_token, download_token_expires_at FROM shop_orders WHERE stripe_session_id = ${session.id} LIMIT 1`;
        if (existing.length > 0 && existing[0].download_token) {
          wasAlreadyConfirmed = existing[0].status === 'payment_confirmed';
          token = existing[0].download_token;
          expiresAt = new Date(existing[0].download_token_expires_at);
        } else {
          ({ token, expiresAt } = createDownloadToken(session.id, productKey || ''));
        }

        await sql`
          INSERT INTO shop_orders (
            status, product_key, email, stripe_session_id, amount_chf,
            download_token, download_token_expires_at, updated_at
          ) VALUES (
            'payment_confirmed', ${productKey}, ${email}, ${session.id}, ${amount},
            ${token}, ${expiresAt.toISOString()}, NOW()
          )
          ON CONFLICT (stripe_session_id) DO UPDATE SET
            status = 'payment_confirmed',
            amount_chf = ${amount},
            download_token = ${token},
            download_token_expires_at = ${expiresAt.toISOString()},
            updated_at = NOW()
        `;
      } catch (dbError) {
        console.error('Mise à jour shop_orders échouée (non bloquante):', dbError.message);
      }

      // Pas de renvoi d'email de confirmation sur une simple redélivrance de
      // l'événement (voir commentaire ci-dessus) — seulement à la toute
      // première confirmation de cette commande.
      if (!wasAlreadyConfirmed) {
        try {
          const siteUrl = process.env.SITE_URL || 'https://smartkids-school.ch';
          const params = new URLSearchParams();
          params.append('form-name', 'shop-order-confirmed');
          params.append('sessionId', session.id);
          params.append('email', email || '');
          params.append('amount', amount ? `${amount} ${(session.currency || 'chf').toUpperCase()}` : '');
          params.append('productKey', productKey || '');

          const res = await fetch(siteUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
          });
          if (!res.ok) {
            console.error('Notification Netlify Forms échouée (statut ' + res.status + '), mais le paiement est bien confirmé ci-dessus.');
          }
        } catch (notifyErr) {
          console.error('Erreur notification (non bloquante):', notifyErr.message);
        }
      }

      return { statusCode: 200, body: JSON.stringify({ received: true }) };
    }

    const email = session.customer_email || session.customer_details?.email || null;

    // Marque la ligne comme payée (créée lors de create-checkout-session.js).
    // UPSERT : si la ligne n'existait pas (ex: écriture initiale échouée),
    // on la crée quand même — le paiement confirmé ne doit jamais se perdre.
    // Stripe peut redélivrer le même événement plusieurs fois (timeout, 5xx
    // transitoire, "resend" manuel) : on retient si la ligne était déjà
    // confirmée AVANT cette écriture, pour ne pas réinviter/ré-notifier sur
    // une simple redélivrance.
    let wasAlreadyConfirmed = false;
    try {
      // En "Lambda compatibility mode" (exports.handler), Netlify n'injecte
      // pas automatiquement la chaîne de connexion : on la passe nous-mêmes.
      const { sql } = getDatabase({ connectionString: process.env.NETLIFY_DB_URL });
      const existing = await sql`SELECT status FROM enrollments WHERE stripe_session_id = ${session.id} LIMIT 1`;
      wasAlreadyConfirmed = existing.length > 0 && existing[0].status === 'payment_confirmed';

      const amount = session.amount_total ? session.amount_total / 100 : null;
      await sql`
        INSERT INTO enrollments (
          source, status, parent_name, email, phone,
          product_key, stripe_session_id, amount_chf, details, updated_at
        ) VALUES (
          ${sourceFromProductKey(session.metadata?.productKey)}, 'payment_confirmed',
          ${session.metadata?.parentName || null}, ${email}, ${session.metadata?.phone || null},
          ${session.metadata?.productKey || null}, ${session.id}, ${amount},
          ${JSON.stringify(session.metadata || {})}, NOW()
        )
        ON CONFLICT (stripe_session_id) DO UPDATE SET
          status = 'payment_confirmed',
          amount_chf = ${amount},
          updated_at = NOW()
      `;
    } catch (dbError) {
      console.error('Mise à jour base de données échouée (non bloquante):', dbError.message);
    }

    if (!wasAlreadyConfirmed) {
      // Donne accès à "Mon espace" au client qui vient de payer (voir la
      // fonction inviteEspaceAccount plus haut pour le détail).
      await inviteEspaceAccount(context && context.clientContext && context.clientContext.identity, email);

      // Notification par email : réutilise Netlify Forms (déjà en place pour
      // les autres formulaires du site) pour envoyer un email de confirmation
      // sans dépendre d'un nouveau service tiers.
      try {
        const siteUrl = process.env.SITE_URL || 'https://smartkids-school.ch';
        const params = new URLSearchParams();
        params.append('form-name', 'payment-confirmed');
        params.append('sessionId', session.id);
        params.append('email', email || '');
        params.append('amount', session.amount_total ? `${session.amount_total / 100} ${(session.currency || 'chf').toUpperCase()}` : '');
        params.append('productKey', session.metadata?.productKey || '');
        params.append('parentName', session.metadata?.parentName || '');
        params.append('phone', session.metadata?.phone || '');

        const res = await fetch(siteUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        });
        if (!res.ok) {
          console.error('Notification Netlify Forms échouée (statut ' + res.status + '), mais le paiement est bien confirmé ci-dessus.');
        }
      } catch (notifyErr) {
        // Ne fait jamais échouer le webhook pour un problème de notification :
        // le paiement est déjà confirmé et loggé, c'est l'essentiel.
        console.error('Erreur notification (non bloquante):', notifyErr.message);
      }
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
