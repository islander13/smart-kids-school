// ─────────────────────────────────────────────────────────────────────────
// Interrupteur central pour les outils de mesure tiers. Bascule à faire ici
// uniquement — CookieBanner.tsx lit ces deux constantes pour décider s'il
// charge GA4/Meta Pixel, même si l'utilisateur a accepté la catégorie
// correspondante (stats/marketing). Plausible n'a pas d'interrupteur ici :
// c'est la mesure par défaut du site, sans cookie, qui reste active tant que
// la catégorie "stats" est acceptée — voir CookieBanner.tsx.
//
// Objectif : le jour où la campagne Meta publicitaire en cours se termine,
// désactiver proprement (et de façon réversible : remettre `true` suffit à
// tout réactiver, rien n'est supprimé côté code) sans toucher au reste de la
// logique de consentement. Ne rien changer ici tant que ce n'est pas
// explicitement demandé — ces deux outils restent actifs par défaut.
//
// Ce qu'on perd en désactivant chacun :
//
// GA4_ENABLED = false
//   - Plus de rapports d'audience/entonnoir/comportement dans Google
//     Analytics (pages vues, provenance du trafic, durée de session, etc.)
//   - Plus de lien entre Google Ads et le comportement sur le site
//     (attribution des conversions à une campagne Google Ads précise)
//   - Plausible (déjà actif) continue de donner des statistiques de base
//     (pages vues, référents, appareils) sans détail par utilisateur.
//
// META_PIXEL_ENABLED = false
//   - Plus de suivi des conversions pour les publicités Meta (Facebook/
//     Instagram) en cours ou futures — impossible de savoir quelle publicité
//     a mené à une inscription/un paiement.
//   - Plus de création d'audiences de reciblage ("les gens qui ont visité
//     /tarifs mais pas payé") ni d'audiences similaires ("lookalike") basées
//     sur les visiteurs du site.
//   - Sans conséquence si aucune campagne Meta n'est active au moment de la
//     désactivation — c'est un outil de mesure publicitaire, pas un outil de
//     mesure du trafic en général (Plausible reste inchangé).
// ─────────────────────────────────────────────────────────────────────────

export const GA4_ENABLED = true;
export const META_PIXEL_ENABLED = true;
