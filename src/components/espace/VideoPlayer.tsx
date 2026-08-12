import { useEffect, useRef, useState } from 'react';
import type { EspaceVideo } from '../../data/espaceContent';
import type { Locale } from '../../i18n/routing';

const WATCHED_LABEL: Record<Locale, { watched: string; markWatched: string }> = {
  FR: { watched: 'Vu', markWatched: 'Marquer comme vue' },
  EN: { watched: 'Watched', markWatched: 'Mark as watched' },
  DE: { watched: 'Gesehen', markWatched: 'Als gesehen markieren' },
};

const ERROR_LABEL: Record<Locale, string> = {
  FR: 'Session expirée, reconnectez-vous.',
  EN: 'Session expired, please log back in.',
  DE: 'Sitzung abgelaufen, bitte erneut anmelden.',
};

// Lecteur en modal, monté seulement au clic sur une vidéo (pas d'iframe
// chargée tant que l'utilisateur n'a pas explicitement choisi de regarder —
// évite de charger N iframes YouTube/Vimeo au chargement de la page).
export default function VideoPlayer({ video, currentLang, watched, onToggleWatched, onClose }: {
  video: EspaceVideo;
  currentLang: Locale;
  watched: boolean;
  onToggleWatched: () => void | Promise<void>;
  onClose: () => void;
}) {
  const embedSrc = video.provider === 'youtube'
    ? `https://www.youtube-nocookie.com/embed/${video.embedId}?autoplay=1`
    : `https://player.vimeo.com/video/${video.embedId}?autoplay=1`;
  const t = WATCHED_LABEL[currentLang];
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  const handleToggle = async () => {
    setPending(true);
    setError(false);
    try {
      await onToggleWatched();
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    closeButtonRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label={video.title[currentLang]}>
      <div className="w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-white font-semibold truncate pr-4">{video.title[currentLang]}</h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleToggle}
              disabled={pending}
              aria-pressed={watched}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                watched ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'border-white/30 text-white/80 hover:border-emerald-400 hover:text-emerald-300'
              }`}
            >
              <i className={watched ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'}></i>
              {watched ? t.watched : t.markWatched}
            </button>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close video"
              className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        {error && <p className="text-red-400 text-xs mb-2 text-right">{ERROR_LABEL[currentLang]}</p>}
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
