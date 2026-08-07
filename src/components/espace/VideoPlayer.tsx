import type { EspaceVideo } from '../../data/espaceContent';
import type { Locale } from '../../i18n/routing';

// Lecteur en modal, monté seulement au clic sur une vidéo (pas d'iframe
// chargée tant que l'utilisateur n'a pas explicitement choisi de regarder —
// évite de charger N iframes YouTube/Vimeo au chargement de la page).
export default function VideoPlayer({ video, currentLang, onClose }: {
  video: EspaceVideo;
  currentLang: Locale;
  onClose: () => void;
}) {
  const embedSrc = video.provider === 'youtube'
    ? `https://www.youtube-nocookie.com/embed/${video.embedId}?autoplay=1`
    : `https://player.vimeo.com/video/${video.embedId}?autoplay=1`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold truncate pr-4">{video.title[currentLang]}</h3>
          <button
            onClick={onClose}
            aria-label="Close video"
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-2xl bg-black" style={{ aspectRatio: '16 / 9' }}>
          <iframe
            src={embedSrc}
            title={video.title[currentLang]}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            style={{ border: 0 }}
          />
        </div>
      </div>
    </div>
  );
}
