import { isPlaceholderVideo, type EspaceSection, type EspaceVideo } from '../data/espaceContent';

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
  // Une vidéo encore en espace réservé (embedId placeholder) ne compte pas
  // dans le total : sans ça, une section pas encore publiée afficherait
  // "0/2 vues" au lieu de ne montrer aucune barre de progression.
  const publishedVideos = section.videos.filter(v => !isPlaceholderVideo(v));
  const totalCount = publishedVideos.length;
  const watchedCount = publishedVideos.filter(v => progress.watched.includes(v.id)).length;
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
      if (isPlaceholderVideo(video)) continue;
      if (!progress.watched.includes(video.id)) {
        return { section, video };
      }
    }
  }
  return null;
}

/** true si au moins une vidéo, dans une section quelconque, est réellement publiée (pas un placeholder). */
export function hasAnyPublishedVideo(sections: EspaceSection[]): boolean {
  return sections.some(section => section.videos.some(v => !isPlaceholderVideo(v)));
}

export function hasQuiz(section: EspaceSection): boolean {
  return !!section.quiz && section.quiz.questions.length > 0;
}

/**
 * Résultat enregistré pour cette section, ou undefined si aucun essai n'a
 * encore été fait — ou si le quiz a changé depuis (nombre de questions
 * différent) : un score enregistré avec l'ancien nombre de questions ne
 * doit pas continuer à compter pour la réussite/le badge une fois le
 * contenu modifié, l'élève doit refaire le quiz mis à jour.
 */
export function getQuizResult(progress: EspaceProgress, section: EspaceSection): QuizResult | undefined {
  const result = progress.quizzes?.[section.key];
  if (!result) return undefined;
  if (section.quiz && result.totalQuestions !== section.quiz.questions.length) return undefined;
  return result;
}

/** Ratio du meilleur essai (0 à 1), ou null si aucun essai valide n'a encore été fait. */
export function getQuizBestRatio(section: EspaceSection, progress: EspaceProgress): number | null {
  const result = getQuizResult(progress, section);
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
