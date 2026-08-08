import type { EspaceSection, EspaceVideo } from '../../data/espaceContent';
import type { Locale } from '../../i18n/routing';

const T: Record<Locale, { eyebrow: string; cta: string; doneTitle: string; doneBody: string }> = {
  FR: {
    eyebrow: 'Reprendre où j’en étais',
    cta: 'Regarder',
    doneTitle: 'Bravo, tout est vu !',
    doneBody: 'Vous avez regardé toutes les vidéos disponibles pour le moment.',
  },
  EN: {
    eyebrow: 'Continue where you left off',
    cta: 'Watch',
    doneTitle: 'All done!',
    doneBody: "You've watched every video available so far.",
  },
  DE: {
    eyebrow: 'Weitermachen, wo Sie aufgehört haben',
    cta: 'Ansehen',
    doneTitle: 'Alles geschafft!',
    doneBody: 'Sie haben alle bisher verfügbaren Videos angesehen.',
  },
};

export default function ContinueBanner({ next, darkMode, currentLang, onPlay }: {
  /** null = plus rien à regarder (tout vu, ou aucune vidéo dans le contenu). */
  next: { section: EspaceSection; video: EspaceVideo } | null;
  darkMode: boolean;
  currentLang: Locale;
  onPlay: (video: EspaceVideo) => void;
}) {
  const t = T[currentLang];
  if (!next) {
    return (
      <div className={`mb-10 p-5 rounded-2xl border-2 flex items-center gap-4 ${darkMode ? 'border-emerald-800 bg-emerald-900/20' : 'border-emerald-200 bg-emerald-50'}`}>
        <i className="ri-checkbox-circle-fill text-3xl text-emerald-500"></i>
        <div>
          <h2 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.doneTitle}</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.doneBody}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-10 p-5 rounded-2xl border-2 flex items-center justify-between gap-4 flex-wrap ${darkMode ? 'border-indigo-800 bg-indigo-900/20' : 'border-indigo-100 bg-indigo-50'}`}>
      <div>
        <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${darkMode ? 'text-indigo-400' : 'text-[#232999]'}`}>{t.eyebrow}</p>
        <h2 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{next.video.title[currentLang]}</h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{next.section.title[currentLang]}</p>
      </div>
      <button
        type="button"
        onClick={() => onPlay(next.video)}
        className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-[#232999] to-indigo-600 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:shadow-lg transition-all cursor-pointer"
      >
        <i className="ri-play-fill"></i>{t.cta}
      </button>
    </div>
  );
}
