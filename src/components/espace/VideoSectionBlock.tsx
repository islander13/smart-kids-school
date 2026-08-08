import { useState } from 'react';
import type { EspaceSection, EspaceVideo } from '../../data/espaceContent';
import type { Locale } from '../../i18n/routing';
import { getSectionProgress, isVideoWatched, type EspaceProgress } from '../../utils/progress';
import ProgressBar from './ProgressBar';
import VideoCard from './VideoCard';
import ResourceList from './ResourceList';
import QuizBlock from './QuizBlock';
import SectionBadge from './SectionBadge';

const T: Record<Locale, { empty: string }> = {
  FR: { empty: 'Aucune vidéo pour le moment dans cette section.' },
  EN: { empty: 'No videos in this section yet.' },
  DE: { empty: 'Noch keine Videos in diesem Bereich.' },
};

export default function VideoSectionBlock({ section, darkMode, currentLang, progress, defaultExpanded, onPlay, onToggleWatched }: {
  section: EspaceSection;
  darkMode: boolean;
  currentLang: Locale;
  progress: EspaceProgress;
  /** Ouvert au premier rendu (ex: section contenant la prochaine vidéo à voir) ; l'utilisateur garde ensuite la main. */
  defaultExpanded: boolean;
  onPlay: (video: EspaceVideo) => void;
  onToggleWatched: (videoId: string) => void;
}) {
  const t = T[currentLang];
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { watchedCount, totalCount } = getSectionProgress(section, progress);
  const badgeUnlockedAt = progress.badges?.[section.key];

  return (
    <section className={`mb-6 rounded-2xl border-2 overflow-hidden ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className={`w-full flex items-center justify-between gap-4 flex-wrap p-5 text-left cursor-pointer transition-colors ${darkMode ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'}`}
      >
        <div className="flex items-center gap-3">
          <i className={`ri-arrow-down-s-line text-xl transition-transform ${expanded ? 'rotate-180' : ''} ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}></i>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{section.title[currentLang]}</h2>
          {badgeUnlockedAt && <i className="ri-medal-line text-lg text-[#d99a2b]" aria-hidden="true"></i>}
        </div>
        {totalCount > 0 && <div className="w-40"><ProgressBar watched={watchedCount} total={totalCount} darkMode={darkMode} /></div>}
      </button>

      {expanded && (
        <div className={`p-5 pt-1 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {badgeUnlockedAt && (
            <div className="mt-5">
              <SectionBadge sectionTitle={section.title[currentLang]} unlockedAt={badgeUnlockedAt} darkMode={darkMode} currentLang={currentLang} />
            </div>
          )}

          {section.videos.length === 0 ? (
            <div className={`mt-5 p-6 rounded-2xl border text-sm text-center ${darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-500'}`}>
              {t.empty}
            </div>
          ) : (
            <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {section.videos.map(video => (
                <VideoCard
                  key={video.id}
                  video={video}
                  darkMode={darkMode}
                  currentLang={currentLang}
                  watched={isVideoWatched(progress, video.id)}
                  onPlay={() => onPlay(video)}
                  onToggleWatched={() => onToggleWatched(video.id)}
                />
              ))}
            </div>
          )}

          <ResourceList resources={section.resources} darkMode={darkMode} currentLang={currentLang} />
          <QuizBlock section={section} darkMode={darkMode} currentLang={currentLang} />
        </div>
      )}
    </section>
  );
}
