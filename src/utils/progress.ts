import type { EspaceSection, EspaceVideo } from '../data/espaceContent';

// ─────────────────────────────────────────────────────────────────────────
// Calculs de progression, dérivés à la volée depuis ESPACE_SECTIONS (contenu)
// + la liste des vidéos vues (stockée par utilisateur). Aucune donnée de
// progression n'est dupliquée dans espaceContent.ts : ce fichier reste
// intact et n'a pas besoin d'un champ "watched" par vidéo.
// ─────────────────────────────────────────────────────────────────────────

export interface EspaceProgress {
  watched: string[];
  lastWatchedVideoId?: string;
  lastActivityAt?: string;
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
