import matter from 'gray-matter';
import { marked } from 'marked';
import type { Locale } from '../i18n/routing';

// Chaque article vit dans content/blog/<slug>/{fr,en,de}.md (frontmatter +
// corps Markdown). Chargés au build par Vite (pas de fetch runtime).
const rawFiles = import.meta.glob('../../content/blog/*/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

interface ArticleFrontmatter {
  title: string;
  description: string;
  excerpt: string;
  date: string; // format YYYY-MM-DD
}

export interface ArticleSummary extends ArticleFrontmatter {
  slug: string;
  locale: Locale;
  readTimeMinutes: number;
}

export interface Article extends ArticleSummary {
  html: string;
}

const LOCALE_BY_FILENAME: Record<string, Locale> = { fr: 'FR', en: 'EN', de: 'DE' };

interface ParsedEntry {
  slug: string;
  locale: Locale;
  frontmatter: ArticleFrontmatter;
  content: string;
}

function readTimeFor(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

const entries: ParsedEntry[] = Object.entries(rawFiles).map(([path, raw]) => {
  const match = path.match(/content\/blog\/([^/]+)\/(fr|en|de)\.md$/);
  if (!match) throw new Error(`Chemin d'article Markdown inattendu : ${path}`);
  const [, slug, filename] = match;
  const { data, content } = matter(raw);
  return { slug, locale: LOCALE_BY_FILENAME[filename], frontmatter: data as ArticleFrontmatter, content };
});

export function getAllArticles(locale: Locale): ArticleSummary[] {
  return entries
    .filter(e => e.locale === locale)
    .map(({ slug, locale, frontmatter, content }) => ({
      slug,
      locale,
      ...frontmatter,
      readTimeMinutes: readTimeFor(content),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getArticle(slug: string, locale: Locale): Article | null {
  const entry = entries.find(e => e.slug === slug && e.locale === locale);
  if (!entry) return null;
  return {
    slug: entry.slug,
    locale: entry.locale,
    ...entry.frontmatter,
    readTimeMinutes: readTimeFor(entry.content),
    html: marked.parse(entry.content) as string,
  };
}
