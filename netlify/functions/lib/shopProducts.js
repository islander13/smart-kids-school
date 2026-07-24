// ─────────────────────────────────────────────────────────────────────────
// Catalogue des produits de la boutique — SOURCE DE VÉRITÉ des prix.
// Comme pour PRODUCTS dans create-checkout-session.js : Stripe ne calcule
// jamais le prix, on le force nous-mêmes ici.
//
// ⚠️ Doit rester synchronisé avec src/lib/shopCatalog.ts (catalogue affiché
// côté site). Les deux fichiers existent séparément car l'un est du code
// serveur CommonJS (netlify/functions, scope npm indépendant) et l'autre du
// code client TypeScript — pas de moyen simple de les partager littéralement.
//
// ⚠️ Prix placeholder (faciles à ajuster). fileKey = nom du fichier attendu
// dans le store Netlify Blobs "ebooks" (voir shop-download.js) — à déposer
// avant toute mise en service.
// ─────────────────────────────────────────────────────────────────────────

const SHOP_PRODUCTS = {
  'carnet-jeune-codeur-scratch': {
    name: 'Le carnet du jeune codeur — 30 défis Scratch à faire en famille',
    price: 15,
    description: '30 mini-défis progressifs, de la première animation au jeu jouable. Dès 7 ans.',
    fileKey: 'carnet-jeune-codeur-scratch.pdf',
  },
  'logique-avant-le-code': {
    name: 'La logique avant le code — 25 jeux de raisonnement pour les 7-11 ans',
    price: 15,
    description: 'Séquences, boucles, conditions expliquées par des énigmes et jeux papier. Sans écran.',
    fileKey: 'logique-avant-le-code.pdf',
  },
  'python-pour-les-enfants': {
    name: 'Python pour les enfants — Du premier programme au premier jeu',
    price: 24,
    description: 'Parcours guidé avec 12 projets complets, pour les 10-15 ans passant de Scratch à Python.',
    fileKey: 'python-pour-les-enfants.pdf',
  },
  'guide-parent-ia': {
    name: "Le guide du parent face à l'IA — Comprendre pour accompagner",
    price: 12,
    description: "Ce que votre enfant doit savoir sur l'IA, et ce que vous devez savoir pour en parler avec lui.",
    fileKey: 'guide-parent-ia.pdf',
  },
};

module.exports = { SHOP_PRODUCTS };
