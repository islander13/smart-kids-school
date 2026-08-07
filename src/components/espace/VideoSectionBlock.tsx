import type { EspaceSection, EspaceVideo } from '../../data/espaceContent';
import type { Locale } from '../../i18n/routing';
import VideoCard from './VideoCard';

const T: Record<Locale, { empty: string }> = {
  FR: { empty: 'Aucune vidéo pour le moment dans cette section.' },
  EN: { empty: 'No videos in this section yet.' },
  DE: { empty: 'Noch keine Videos in diesem Bereich.' },
};

export default function VideoSectionBlock({ section, darkMode, currentLang, onPlay }: {
  section: EspaceSection;
  darkMode: boolean;
  currentLang: Locale;
  onPlay: (video: EspaceVideo) => void;
}) {
  const t = T[currentLang];

  return (
    <section className="mb-12">
      <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{section.title[currentLang]}</h2>
      {section.videos.length === 0 ? (
        <div className={`p-6 rounded-2xl border text-sm text-center ${darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-500'}`}>
          {t.empty}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {section.videos.map(video => (
            <VideoCard key={video.id} video={video} darkMode={darkMode} currentLang={currentLang} onPlay={() => onPlay(video)} />
          ))}
        </div>
      )}
    </section>
  );
}
