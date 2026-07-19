export type Locale = 'FR' | 'EN' | 'DE';

const PREFIXES: Record<Locale, string> = { FR: '', EN: '/en', DE: '/de' };

export const LOCALES: Locale[] = ['FR', 'EN', 'DE'];

// Chemins canoniques (français, sans préfixe) de toutes les pages indexables.
// Ne pas inclure "*" (404) : une page d'erreur n'a pas d'équivalent multilingue indexable.
export const BASE_PATHS = ['/', '/tarifs', '/stages', '/premium', '/faq', '/merci', '/legal', '/cgv'] as const;

// Liens directs "à envoyer" vers un formulaire d'inscription précis, qui ouvrent
// automatiquement la modal correspondante à l'arrivée sur la page. Volontairement
// exclus du sitemap/hreflang (noindex) : ce sont des liens de vente, pas du contenu.
export const FORM_DEEPLINK_PATHS = ['/tarifs/inscription', '/stages/inscription', '/premium/inscription'] as const;

// Déduit la langue et le chemin de base (français) à partir d'un pathname courant.
export function parseLocaleFromPath(pathname: string): { locale: Locale; basePath: string } {
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const rest = pathname.slice(3);
    return { locale: 'EN', basePath: rest === '' ? '/' : rest };
  }
  if (pathname === '/de' || pathname.startsWith('/de/')) {
    const rest = pathname.slice(3);
    return { locale: 'DE', basePath: rest === '' ? '/' : rest };
  }
  return { locale: 'FR', basePath: pathname === '' ? '/' : pathname };
}

// Construit l'URL localisée pour un chemin de base (français) et une langue cible.
// Gère aussi les ancres (ex: '/#parcours' → '/en#parcours').
export function localizedPath(basePath: string, locale: Locale): string {
  const hashIndex = basePath.indexOf('#');
  const path = hashIndex === -1 ? basePath : basePath.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : basePath.slice(hashIndex);
  const prefix = PREFIXES[locale];
  const localizedBase = path === '/' ? (prefix === '' ? '/' : prefix) : `${prefix}${path}`;
  return `${localizedBase}${hash}`;
}

// Code hreflang standard (fr-CH, en-CH, de-CH) pour une langue donnée.
export function hreflangCode(locale: Locale): string {
  return { FR: 'fr-CH', EN: 'en-CH', DE: 'de-CH' }[locale];
}

// Injecte/actualise les balises <link rel="alternate" hreflang="..."> + canonical
// pour la page courante. À appeler depuis le useEffect SEO de chaque page, avec
// son basePath français (ex: '/tarifs') et sa langue affichée.
export function setHreflangTags(basePath: string, currentLocale: Locale) {
  const origin = 'https://smartkids-school.ch';

  const upsertLink = (rel: string, hreflang: string | null, href: string) => {
    const selector = hreflang
      ? `link[rel="${rel}"][hreflang="${hreflang}"]`
      : `link[rel="${rel}"]`;
    let el = document.querySelector(selector) as HTMLLinkElement | null;
    if (!el) {
      el = document.createElement('link');
      el.rel = rel;
      if (hreflang) el.hreflang = hreflang;
      document.head.appendChild(el);
    }
    el.href = href;
  };

  LOCALES.forEach(locale => {
    upsertLink('alternate', hreflangCode(locale), `${origin}${localizedPath(basePath, locale)}`);
  });
  // x-default : version servie par défaut (française) aux moteurs/langues non listées.
  upsertLink('alternate', 'x-default', `${origin}${localizedPath(basePath, 'FR')}`);
  // Canonical : l'URL de la page courante elle-même (chaque langue est sa propre page canonique).
  upsertLink('canonical', null, `${origin}${localizedPath(basePath, currentLocale)}`);
}