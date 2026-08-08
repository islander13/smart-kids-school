import type { EspaceSection, EspaceVideo } from '../data/espaceContent';

// ─────────────────────────────────────────────────────────────────────────
// Calculs de progression, dérivés à la volée depuis ESPACE_SECTIONS (contenu)
// + l'état par utilisateur (vidéos vues, scores de quiz, badges). Aucune
// donnée de progression n'est dupliquée dans espaceContent.ts : ce fichier
// reste la seule source de vérité pour le contenu, jamais pour qui a fait quoi.
// ─────────────────────────────────────────────────────────────────────────

export interface QuizResult {
  /** Nombre de bonnes réponses au meilleur essai. */
  bestScoreCount: number;
  totalQuestions: number;
  lastAttemptAt: string;
}

export interface EspaceProgress {
  watched: string[];
  lastWatchedVideoId?: string;
  lastActivityAt?: string;
  /** Clé = EspaceSection.key. */
  quizzes?: Record<string, QuizResult>;
  /** Clé = EspaceSection.key, valeur = date ISO d'obtention du badge. */
  badges?: Record<string, string>;
}

export const EMPTY_PROGRESS: EspaceProgress = { watched: [] };

export function isVideoWatched(progress: EspaceProgress, videoId: string): boolean {
  return progress.watched.includes(videoId);
}

export function getSectionProgress(section: EspaceSection, progress: EspaceProgress): { watchedCount: number; totalCount: number } {
  const totalCount = section.videos.length;
  const watchedCount = section.videos.filter(v => progress.watched.includes(v.id)).length;
  return { watchedCount, totalCount };
}

export function getTotalProgress(sections: EspaceSection[], progress: EspaceProgress): { watchedCount: number; totalCount: number } {
  return sections.reduce(
    (acc, section) => {
      const { watchedCount, totalCount } = getSectionProgress(section, progress);
      return { watchedCount: acc.watchedCount + watchedCount, totalCount: acc.totalCount + totalCount };
    },
    { watchedCount: 0, totalCount: 0 }
  );
}

export function getNextUnwatchedVideo(sections: EspaceSection[], progress: EspaceProgress): { section: EspaceSection; video: EspaceVideo } | null {
  for (const section of sections) {
    for (const video of section.videos) {
      if (!progress.watched.includes(video.id)) {
        return { section, video };
      }
    }
  }
  return null;
}

export function hasQuiz(section: EspaceSection): boolean {
  return !!section.quiz && section.quiz.questions.length > 0;
}

export function getQuizResult(progress: EspaceProgress, sectionKey: string): QuizResult | undefined {
  return progress.quizzes?.[sectionKey];
}

/** Ratio du meilleur essai (0 à 1), ou null si aucun essai n'a encore été fait. */
export function getQuizBestRatio(section: EspaceSection, progress: EspaceProgress): number | null {
  const result = getQuizResult(progress, section.key);
  if (!result || result.totalQuestions === 0) return null;
  return result.bestScoreCount / result.totalQuestions;
}

export function isSectionQuizPassed(section: EspaceSection, progress: EspaceProgress): boolean {
  if (!hasQuiz(section)) return true; // pas de quiz = pas de barrière
  const ratio = getQuizBestRatio(section, progress);
  return ratio !== null && ratio >= section.quiz!.passThreshold;
}

/** Toutes les vidéos vues ET (pas de quiz, ou quiz réussi). Une section sans vidéo n'est jamais "complète". */
export function isSectionComplete(section: EspaceSection, progress: EspaceProgress): boolean {
  const { watchedCount, totalCount } = getSectionProgress(section, progress);
  if (totalCount === 0) return false;
  return watchedCount === totalCount && isSectionQuizPassed(section, progress);
}

export function isSectionBadgeUnlocked(progress: EspaceProgress, sectionKey: string): boolean {
  return !!progress.badges?.[sectionKey];
}

/**
 * Recalcule les badges à partir de l'état courant : ajoute une date pour
 * toute section nouvellement complète qui n'a pas encore de badge. N'enlève
 * jamais un badge déjà obtenu (même si, en théorie, le contenu changeait
 * après coup). Retourne le même objet `progress` si rien ne change (évite
 * une écriture réseau inutile).
 */
export function withUpdatedBadges(sections: EspaceSection[], progress: EspaceProgress): EspaceProgress {
  const badges = { ...(progress.badges || {}) };
  let changed = false;
  for (const section of sections) {
    if (badges[section.key]) continue;
    if (isSectionComplete(section, progress)) {
      badges[section.key] = new Date().toISOString();
      changed = true;
    }
  }
  return changed ? { ...progress, badges } : progress;
}
