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

export default function VideoSectionBlock({ section, darkMode, currentLang, progress, onPlay, onToggleWatched }: {
  section: EspaceSection;
  darkMode: boolean;
  currentLang: Locale;
  progress: EspaceProgress;
  onPlay: (video: EspaceVideo) => void;
  onToggleWatched: (videoId: string) => void;
}) {
  const t = T[currentLang];
  const { watchedCount, totalCount } = getSectionProgress(section, progress);
  const badgeUnlockedAt = progress.badges?.[section.key];

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{section.title[currentLang]}</h2>
        {totalCount > 0 && <div className="w-40"><ProgressBar watched={watchedCount} total={totalCount} darkMode={darkMode} /></div>}
      </div>

      {badgeUnlockedAt && (
        <SectionBadge sectionTitle={section.title[currentLang]} unlockedAt={badgeUnlockedAt} darkMode={darkMode} currentLang={currentLang} />
      )}

      {section.videos.length === 0 ? (
        <div className={`p-6 rounded-2xl border text-sm text-center ${darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-500'}`}>
          {t.empty}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
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
    </section>
  );
}
