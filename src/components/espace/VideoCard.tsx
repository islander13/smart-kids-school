import { useState } from 'react';
import { isPlaceholderVideo, type EspaceVideo } from '../../data/espaceContent';
import type { Locale } from '../../i18n/routing';

const MIN_LABEL: Record<Locale, (n: number) => string> = {
  FR: (n) => `${n} min`,
  EN: (n) => `${n} min`,
  DE: (n) => `${n} Min.`,
};

const WATCHED_LABEL: Record<Locale, { watched: string; markWatched: string }> = {
  FR: { watched: 'Vu', markWatched: 'Marquer comme vue' },
  EN: { watched: 'Watched', markWatched: 'Mark as watched' },
  DE: { watched: 'Gesehen', markWatched: 'Als gesehen markieren' },
};

const COMING_SOON_LABEL: Record<Locale, string> = {
  FR: 'Bientôt disponible',
  EN: 'Coming soon',
  DE: 'Bald verfügbar',
};

function thumbnailFor(video: EspaceVideo): string | null {
  if (video.thumbnail) return video.thumbnail;
  if (video.provider === 'youtube') return `https://img.youtube.com/vi/${video.embedId}/hqdefault.jpg`;
  return null; // Vimeo sans thumbnail fourni : pas d'URL prévisible, on retombe sur un placeholder.
}

export default function VideoCard({ video, darkMode, currentLang, watched, onPlay, onToggleWatched }: {
  video: EspaceVideo;
  darkMode: boolean;
  currentLang: Locale;
  watched: boolean;
  onPlay: () => void;
  onToggleWatched: () => void | Promise<void>;
}) {
  const thumbnail = thumbnailFor(video);
  const t = WATCHED_LABEL[currentLang];
  const [pending, setPending] = useState(false);
  const comingSoon = isPlaceholderVideo(video);

  const handleToggle = async () => {
    setPending(true);
    try {
      await onToggleWatched();
    } finally {
      setPending(false);
    }
  };

  // Vidéo pas encore publiée (embedId placeholder) : carte non cliquable,
  // pas de vignette YouTube cassée, pas de "marquer comme vue" — plutôt que
  // d'ouvrir un lecteur pointant vers une vidéo qui n'existe pas.
  if (comingSoon) {
    return (
      <div className={`flex flex-col rounded-2xl border-2 border-dashed overflow-hidden opacity-70 ${darkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-300 bg-gray-50'}`}>
        <div className={`relative aspect-video flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
          <i className="ri-time-line text-4xl text-gray-400"></i>
          <span className={`absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-xs font-medium ${darkMode ? 'bg-black/70 text-gray-300' : 'bg-white/90 text-gray-600'}`}>
            {COMING_SOON_LABEL[currentLang]}
          </span>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className={`font-bold text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{video.title[currentLang]}</h3>
          <p className={`text-xs leading-relaxed flex-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{video.description[currentLang]}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`group flex flex-col rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg ${darkMode ? 'border-gray-700 bg-gray-800/50 hover:border-indigo-400' : 'border-gray-200 bg-white hover:border-[#232999]'}`}>
      <button type="button" onClick={onPlay} className={`relative aspect-video flex items-center justify-center cursor-pointer ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
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
        {watched && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-500/90 text-white text-xs font-semibold flex items-center gap-1">
            <i className="ri-checkbox-circle-fill"></i>{t.watched}
          </span>
        )}
      </button>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className={`font-bold text-sm mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{video.title[currentLang]}</h3>
        <p className={`text-xs leading-relaxed flex-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{video.description[currentLang]}</p>
        <button
          type="button"
          onClick={handleToggle}
          disabled={pending}
          aria-pressed={watched}
          className={`mt-3 self-start flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
            watched
              ? darkMode ? 'bg-emerald-900/30 border-emerald-700 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : darkMode ? 'border-gray-600 text-gray-400 hover:border-emerald-500 hover:text-emerald-400' : 'border-gray-300 text-gray-500 hover:border-emerald-400 hover:text-emerald-600'
          }`}
        >
          <i className={watched ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'}></i>
          {watched ? t.watched : t.markWatched}
        </button>
      </div>
    </div>
  );
}
