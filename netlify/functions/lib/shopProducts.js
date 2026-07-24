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
// ⚠️⚠️ CONTENU PLACEHOLDER — à remplacer avant mise en service :
//   titre, prix, description, et fileKey (nom du fichier dans le store
//   Netlify Blobs "ebooks", voir shop-download.js).
// ─────────────────────────────────────────────────────────────────────────

const SHOP_PRODUCTS = {
  'premier-pas-en-python': {
    name: '[Titre à définir] — Ebook',
    price: 19, // CHF — placeholder
    description: 'Description à définir.',
    fileKey: 'premier-pas-en-python.pdf', // TODO: uploader le vrai fichier dans le store Blobs "ebooks"
  },
};

module.exports = { SHOP_PRODUCTS };
