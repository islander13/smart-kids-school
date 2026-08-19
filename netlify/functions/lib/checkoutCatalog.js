// ─────────────────────────────────────────────────────────────────────────
// Catalogue des produits tarifs/stages/premium (prix internes, source de
// vérité — Stripe ne les calcule pas, on les force). Extrait de
// create-checkout-session.js pour être testable en isolation
// (tests/checkoutCatalog.test.js) sans dépendre du SDK Stripe ni de la DB.
// ─────────────────────────────────────────────────────────────────────────

// Déduit la source (tarifs / stages / premium) à partir du productKey,
// pour classer chaque ligne de la table `enrollments`.
function sourceFromProductKey(productKey) {
  if (productKey.startsWith('stage-')) return 'stages';
  if (productKey.startsWith('premium-')) return 'premium';
  return 'tarifs';
}

const PRODUCTS = {
  // ─── SOLO — paiement mensuel (abonnement) ───
  'solo-m3':  { name: 'SKS Solo - 3 mois (paiement mensuel)',  price: 299, recurring: true, description: 'Cours individuel personnalisé. 4 séances de 1h30 par mois. Engagement minimum 3 mois.' },
  'solo-m6':  { name: 'SKS Solo - 6 mois (paiement mensuel)',  price: 269, recurring: true, description: 'Cours individuel personnalisé. 4 séances de 1h30 par mois. Engagement 6 mois.' },
  'solo-m12': { name: 'SKS Solo - 12 mois (paiement mensuel)', price: 249, recurring: true, description: 'Cours individuel personnalisé. 4 séances de 1h30 par mois. Engagement 12 mois.' },

  // ─── SOLO — paiement en une fois (paiement unique, ~10% de rabais) ───
  'solo-m3-once':  { name: 'SKS Solo - 3 mois (paiement unique)',  price: 799,  recurring: false, description: 'Cours individuel personnalisé, 3 mois réglés en une fois. Rabais paiement comptant.' },
  'solo-m6-once':  { name: 'SKS Solo - 6 mois (paiement unique)',  price: 1449, recurring: false, description: 'Cours individuel personnalisé, 6 mois réglés en une fois. Rabais paiement comptant.' },
  'solo-m12-once': { name: 'SKS Solo - 12 mois (paiement unique)', price: 2689, recurring: false, description: 'Cours individuel personnalisé, 12 mois réglés en une fois. Rabais paiement comptant.' },

  // ─── DUO (tarif total famille) — paiement mensuel (abonnement) ───
  'duo-m3':  { name: 'SKS Duo - 3 mois (paiement mensuel)',  price: 398, recurring: true, description: 'Cours partagé pour 2 enfants (frère/sœur/ami). Tarif total famille. Engagement minimum 3 mois.' },
  'duo-m6':  { name: 'SKS Duo - 6 mois (paiement mensuel)',  price: 358, recurring: true, description: 'Cours partagé pour 2 enfants. Tarif total famille. Engagement 6 mois.' },
  'duo-m12': { name: 'SKS Duo - 12 mois (paiement mensuel)', price: 338, recurring: true, description: 'Cours partagé pour 2 enfants. Tarif total famille. Engagement 12 mois.' },

  // ─── DUO — paiement en une fois (paiement unique, ~10% de rabais) ───
  'duo-m3-once':  { name: 'SKS Duo - 3 mois (paiement unique)',  price: 1079, recurring: false, description: 'Cours partagé pour 2 enfants, 3 mois réglés en une fois. Rabais paiement comptant.' },
  'duo-m6-once':  { name: 'SKS Duo - 6 mois (paiement unique)',  price: 1929, recurring: false, description: 'Cours partagé pour 2 enfants, 6 mois réglés en une fois. Rabais paiement comptant.' },
  'duo-m12-once': { name: 'SKS Duo - 12 mois (paiement unique)', price: 3649, recurring: false, description: 'Cours partagé pour 2 enfants, 12 mois réglés en une fois. Rabais paiement comptant.' },

  // ─── PREMIUM (prix inchangés) ───
  'premium-monthly': { name: 'SKS Premium - Sans Engagement',              price: 999,   recurring: true,  description: 'Mentorat individuel avec le fondateur : 2 séances par semaine, projet publié en 12 mois, préparation aux concours, bilan trimestriel, accès direct au fondateur, 2 stages offerts/an.' },
  'premium-yearly':  { name: 'SKS Premium - 12 mois (paiement total -10%)', price: 10789, recurring: false, description: 'Offre Premium en paiement total 12 mois avec rabais 10%.' },

  // ─── STAGES (prix inchangés) ───
  'stage-1child':    { name: 'SKS Stage de Programmation - 1 Enfant',                    price: 449, recurring: false, description: 'Stage de programmation. 4 demi-journées de 3h sur 1 semaine de vacances scolaires.' },
  'stage-2children': { name: 'SKS Stage de Programmation - 2 Enfants (forfait famille)', price: 799, recurring: false, description: 'Stage pour 2 enfants. Forfait famille avec rabais 11% (économie 99 CHF).' },
};

module.exports = { PRODUCTS, sourceFromProductKey };
