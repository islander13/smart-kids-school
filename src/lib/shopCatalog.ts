import type { Locale } from '../i18n/routing';

// ─────────────────────────────────────────────────────────────────────────
// Catalogue des produits de la boutique (ebooks...), affiché sur les pages
// src/pages/shop/*. Pensé pour accueillir plusieurs produits plus tard :
// ajouter une entrée ici suffit, les pages liste/produit s'adaptent.
//
// ⚠️ Le prix ici est uniquement pour l'AFFICHAGE. Le prix réellement facturé
// vient de netlify/functions/lib/shopProducts.js (source de vérité) — les
// deux doivent être tenus synchronisés à la main.
//
// ⚠️⚠️ CONTENU PLACEHOLDER — à remplacer avant mise en service (titre, prix,
// description, accroche). Le slug doit rester identique à la clé utilisée
// dans netlify/functions/lib/shopProducts.js (SHOP_PRODUCTS).
// ─────────────────────────────────────────────────────────────────────────

export interface ShopProduct {
  slug: string;
  priceCHF: number;
  emoji: string; // repère visuel en attendant une vraie couverture (voir coverImage)
  coverImage?: string; // chemin dans /public, ex: '/shop/mon-ebook-cover.png' — optionnel tant qu'absent
  title: Record<Locale, string>;
  tagline: Record<Locale, string>;
  description: Record<Locale, string>;
}

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    slug: 'premier-pas-en-python',
    priceCHF: 19,
    emoji: '📘',
    title: {
      FR: '[Titre à définir] — Ebook',
      EN: '[Title TBD] — Ebook',
      DE: '[Titel TBD] — Ebook',
    },
    tagline: {
      FR: 'Accroche courte à définir.',
      EN: 'Short tagline to define.',
      DE: 'Kurzer Slogan zu definieren.',
    },
    description: {
      FR: 'Description complète du contenu de l\'ebook à rédiger avant mise en service.',
      EN: 'Full description of the ebook content, to be written before launch.',
      DE: 'Vollständige Beschreibung des Ebook-Inhalts, vor dem Start zu verfassen.',
    },
  },
];

export function getShopProduct(slug: string): ShopProduct | undefined {
  return SHOP_PRODUCTS.find(p => p.slug === slug);
}
