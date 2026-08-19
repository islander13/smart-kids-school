import { describe, it, expect } from 'vitest';
import {
  EMPTY_PROGRESS,
  isVideoWatched,
  getSectionProgress,
  getTotalProgress,
  getNextUnwatchedVideo,
  hasAnyPublishedVideo,
  hasQuiz,
  getQuizResult,
  getQuizBestRatio,
  isSectionQuizPassed,
  isSectionComplete,
  isSectionBadgeUnlocked,
  withUpdatedBadges,
  type EspaceProgress,
} from '../src/utils/progress';
import { PLACEHOLDER_EMBED_ID, type EspaceSection, type EspaceVideo } from '../src/data/espaceContent';

// Fixtures synthétiques plutôt que ESPACE_SECTIONS réel : le contenu change
// (nouvelles vidéos, nouveaux quiz), la logique de calcul ne doit pas en
// dépendre pour rester testable dans le temps.
const text = (s: string) => ({ FR: s, EN: s, DE: s });

function makeVideo(id: string, opts: Partial<EspaceVideo> = {}): EspaceVideo {
  return {
    id,
    title: text(id),
    description: text(''),
    durationMinutes: 5,
    provider: 'youtube',
    embedId: 'real-id-' + id,
    ...opts,
  };
}

const sectionNoQuiz: EspaceSection = {
  key: 'intro',
  title: text('Intro'),
  videos: [makeVideo('v1'), makeVideo('v2')],
  resources: [],
};

const sectionWithQuiz: EspaceSection = {
  key: 'avance',
  title: text('Avancé'),
  videos: [makeVideo('v3')],
  resources: [],
  quiz: {
    passThreshold: 0.7,
    questions: [
      { id: 'q1', prompt: text(''), multiple: false, options: [{ id: 'a', label: text('') }, { id: 'b', label: text('') }], correctOptionIds: ['a'] },
      { id: 'q2', prompt: text(''), multiple: false, options: [{ id: 'a', label: text('') }, { id: 'b', label: text('') }], correctOptionIds: ['b'] },
      { id: 'q3', prompt: text(''), multiple: false, options: [{ id: 'a', label: text('') }, { id: 'b', label: text('') }], correctOptionIds: ['a'] },
    ],
  },
};

const sectionAllPlaceholder: EspaceSection = {
  key: 'a-venir',
  title: text('À venir'),
  videos: [makeVideo('v4', { embedId: PLACEHOLDER_EMBED_ID })],
  resources: [],
};

describe('isVideoWatched / EMPTY_PROGRESS', () => {
  it('EMPTY_PROGRESS ne contient aucune vidéo vue', () => {
    expect(EMPTY_PROGRESS.watched).toEqual([]);
  });

  it('détecte une vidéo vue et une non vue', () => {
    const progress: EspaceProgress = { watched: ['v1'] };
    expect(isVideoWatched(progress, 'v1')).toBe(true);
    expect(isVideoWatched(progress, 'v2')).toBe(false);
  });
});

describe('getSectionProgress / getTotalProgress', () => {
  it('compte les vidéos vues sur le total de vidéos publiées', () => {
    const progress: EspaceProgress = { watched: ['v1'] };
    expect(getSectionProgress(sectionNoQuiz, progress)).toEqual({ watchedCount: 1, totalCount: 2 });
  });

  it('une section 100% placeholder a un total de 0 (jamais "0/0" trompeur affiché comme complet)', () => {
    const progress: EspaceProgress = { watched: [] };
    expect(getSectionProgress(sectionAllPlaceholder, progress)).toEqual({ watchedCount: 0, totalCount: 0 });
  });

  it('getTotalProgress additionne toutes les sections publiées', () => {
    const progress: EspaceProgress = { watched: ['v1', 'v3'] };
    const total = getTotalProgress([sectionNoQuiz, sectionWithQuiz, sectionAllPlaceholder], progress);
    expect(total).toEqual({ watchedCount: 2, totalCount: 3 }); // v1+v2 (section 1) + v3 (section 2), placeholder exclu
  });
});

describe('hasAnyPublishedVideo', () => {
  it('true si au moins une section a une vraie vidéo', () => {
    expect(hasAnyPublishedVideo([sectionAllPlaceholder, sectionNoQuiz])).toBe(true);
  });

  it('false si tout est placeholder', () => {
    expect(hasAnyPublishedVideo([sectionAllPlaceholder])).toBe(false);
  });
});

describe('getNextUnwatchedVideo', () => {
  it('retourne la première vidéo non vue, en sautant les placeholders', () => {
    const progress: EspaceProgress = { watched: ['v1'] };
    const next = getNextUnwatchedVideo([sectionAllPlaceholder, sectionNoQuiz], progress);
    expect(next?.video.id).toBe('v2');
  });

  it('retourne null si tout est vu', () => {
    const progress: EspaceProgress = { watched: ['v1', 'v2'] };
    expect(getNextUnwatchedVideo([sectionNoQuiz], progress)).toBeNull();
  });
});

describe('quiz : hasQuiz / getQuizResult / getQuizBestRatio / isSectionQuizPassed', () => {
  it('hasQuiz distingue une section avec et sans quiz', () => {
    expect(hasQuiz(sectionWithQuiz)).toBe(true);
    expect(hasQuiz(sectionNoQuiz)).toBe(false);
  });

  it('sans quiz, isSectionQuizPassed est toujours vrai (pas de barrière)', () => {
    expect(isSectionQuizPassed(sectionNoQuiz, EMPTY_PROGRESS)).toBe(true);
  });

  it('un score sous le seuil ne valide pas le quiz', () => {
    const progress: EspaceProgress = {
      watched: [],
      quizzes: { avance: { bestScoreCount: 1, totalQuestions: 3, lastAttemptAt: new Date().toISOString() } }, // 33%
    };
    expect(getQuizBestRatio(sectionWithQuiz, progress)).toBeCloseTo(1 / 3);
    expect(isSectionQuizPassed(sectionWithQuiz, progress)).toBe(false);
  });

  it('un score au-dessus du seuil (70%) valide le quiz', () => {
    const progress: EspaceProgress = {
      watched: [],
      quizzes: { avance: { bestScoreCount: 3, totalQuestions: 3, lastAttemptAt: new Date().toISOString() } }, // 100%
    };
    expect(isSectionQuizPassed(sectionWithQuiz, progress)).toBe(true);
  });

  it('un score enregistré avec un nombre de questions différent (contenu modifié depuis) est ignoré', () => {
    const progress: EspaceProgress = {
      watched: [],
      quizzes: { avance: { bestScoreCount: 3, totalQuestions: 5, lastAttemptAt: new Date().toISOString() } }, // 5 questions à l'époque, 3 maintenant
    };
    expect(getQuizResult(progress, sectionWithQuiz)).toBeUndefined();
    expect(isSectionQuizPassed(sectionWithQuiz, progress)).toBe(false);
  });
});

describe('isSectionComplete', () => {
  it('fausse si aucune vidéo publiée (section 100% placeholder)', () => {
    expect(isSectionComplete(sectionAllPlaceholder, EMPTY_PROGRESS)).toBe(false);
  });

  it('vraie seulement quand toutes les vidéos sont vues ET le quiz (s\'il existe) est réussi', () => {
    const partiallyWatched: EspaceProgress = { watched: ['v3'] }; // vidéo vue, pas de quiz réussi
    expect(isSectionComplete(sectionWithQuiz, partiallyWatched)).toBe(false);

    const watchedAndPassed: EspaceProgress = {
      watched: ['v3'],
      quizzes: { avance: { bestScoreCount: 3, totalQuestions: 3, lastAttemptAt: new Date().toISOString() } },
    };
    expect(isSectionComplete(sectionWithQuiz, watchedAndPassed)).toBe(true);
  });

  it('une section sans quiz est complète dès que ses vidéos sont vues', () => {
    expect(isSectionComplete(sectionNoQuiz, { watched: ['v1', 'v2'] })).toBe(true);
    expect(isSectionComplete(sectionNoQuiz, { watched: ['v1'] })).toBe(false);
  });
});

describe('withUpdatedBadges', () => {
  it('débloque un badge pour une section fraîchement complétée', () => {
    const progress: EspaceProgress = { watched: ['v1', 'v2'] };
    const updated = withUpdatedBadges([sectionNoQuiz], progress);
    expect(isSectionBadgeUnlocked(updated, 'intro')).toBe(true);
  });

  it('ne retire jamais un badge déjà obtenu, même si la progression semble régresser', () => {
    const progress: EspaceProgress = { watched: [], badges: { intro: '2026-01-01T00:00:00.000Z' } };
    const updated = withUpdatedBadges([sectionNoQuiz], progress);
    expect(isSectionBadgeUnlocked(updated, 'intro')).toBe(true);
    expect(updated.badges?.intro).toBe('2026-01-01T00:00:00.000Z'); // date inchangée, pas régénérée
  });

  it('retourne le MÊME objet (pas de nouvel objet) si rien n\'a changé — évite une écriture réseau inutile', () => {
    const progress: EspaceProgress = { watched: [] };
    const updated = withUpdatedBadges([sectionAllPlaceholder], progress);
    expect(updated).toBe(progress);
  });
});
