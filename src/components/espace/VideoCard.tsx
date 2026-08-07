import type { EspaceVideo } from '../../data/espaceContent';
import type { Locale } from '../../i18n/routing';

const MIN_LABEL: Record<Locale, (n: number) => string> = {
  FR: (n) => `${n} min`,
  EN: (n) => `${n} min`,
  DE: (n) => `${n} Min.`,
};

function thumbnailFor(video: EspaceVideo): string | null {
  if (video.thumbnail) return video.thumbnail;
  if (video.provider === 'youtube') return `https://img.youtube.com/vi/${video.embedId}/hqdefault.jpg`;
  return null; // Vimeo sans thumbnail fourni : pas d'URL prévisible, on retombe sur un placeholder.
}

export default function VideoCard({ video, darkMode, currentLang, onPlay }: {
  video: EspaceVideo;
  darkMode: boolean;
  currentLang: Locale;
  onPlay: () => void;
}) {
  const thumbnail = thumbnailFor(video);

  return (
    <button
      type="button"
      onClick={onPlay}
      className={`group text-left flex flex-col rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg cursor-pointer ${darkMode ? 'border-gray-700 bg-gray-800/50 hover:border-indigo-400' : 'border-gray-200 bg-white hover:border-[#232999]'}`}
    >
      <div className={`relative aspect-video flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        {thumbnail ? (
          <img src={thumbnail} alt="" loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <i className="ri-video-line text-4xl text-gray-400"></i>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <i className="ri-play-fill text-2xl text-[#232999] ml-0.5"></i>
          </div>
        </div>
        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-xs font-medium">
          {MIN_LABEL[currentLang](video.durationMinutes)}
        </span>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className={`font-bold text-sm mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{video.title[currentLang]}</h3>
        <p className={`text-xs leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{video.description[currentLang]}</p>
      </div>
    </button>
  );
}
