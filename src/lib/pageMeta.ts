import pageMetaJson from '../data/pageMeta.json';
import type { Locale } from '../i18n/routing';

// Source unique pour le titre/la description de chaque page statique
// indexable, par langue — importée à la fois ici (React, pour
// document.title/meta au montage) et par scripts/generate-meta-map.mjs
// (pour netlify/edge-functions/meta-rewrite.ts, qui pose les mêmes valeurs
// dans le HTML servi avant que React ne s'exécute). Un seul endroit à
// modifier pour changer un titre — voir le rapport d'avancement pour le
// pourquoi (rendu 100% client, sinon invisible aux robots/aperçus sans JS).
export interface PageMetaEntry {
  title: string;
  description: string;
}

type PageMetaTable = Record<string, Record<Locale, PageMetaEntry>>;

const pageMeta = pageMetaJson as PageMetaTable;

export function getPageMeta(basePath: string, locale: Locale): PageMetaEntry {
  const entry = pageMeta[basePath]?.[locale];
  if (!entry) throw new Error(`pageMeta: aucune entrée pour "${basePath}" / "${locale}"`);
  return entry;
}
