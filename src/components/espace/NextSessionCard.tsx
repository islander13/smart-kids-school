import type { Locale } from '../../i18n/routing';
import { useAuth } from '../../contexts/AuthContext';

// ─────────────────────────────────────────────────────────────────────────
// Carte "Prochain cours" : affiche le lien de la prochaine séance (Zoom ou
// équivalent) quand l'école l'a renseigné pour ce compte. Volontairement
// réglé à la main pour l'instant (pas d'intégration Zoom/Calendly) :
//
// Pour renseigner un lien, dans le dashboard Netlify → Identity → Users →
// (choisir le compte) → Metadata → app_metadata, ajouter :
//   {
//     "nextSession": {
//       "label": "Cours hebdo",                         (optionnel)
//       "dateTime": "2026-08-13T17:00:00+02:00",         (ISO 8601, avec fuseau)
//       "joinUrl": "https://zoom.us/j/xxxxxxxxx"
//     }
//   }
// app_metadata (pas user_metadata) volontairement : ce champ n'est pas
// modifiable par le compte lui-même, seulement par l'école — même logique
// que app_metadata.linkedChildren (voir link-child.js).
// ─────────────────────────────────────────────────────────────────────────

interface NextSession {
  label?: string;
  dateTime: string;
  joinUrl: string;
}

function readNextSession(raw: unknown): NextSession | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.dateTime !== 'string' || typeof obj.joinUrl !== 'string') return null;
  const date = new Date(obj.dateTime);
  if (Number.isNaN(date.getTime())) return null;
  return {
    label: typeof obj.label === 'string' ? obj.label : undefined,
    dateTime: obj.dateTime,
    joinUrl: obj.joinUrl,
  };
}

const DATE_LOCALE: Record<Locale, string> = { FR: 'fr-CH', EN: 'en-GB', DE: 'de-CH' };

const T: Record<Locale, { defaultLabel: string; join: string }> = {
  FR: { defaultLabel: 'Prochain cours', join: 'Rejoindre le cours' },
  EN: { defaultLabel: 'Next session', join: 'Join the session' },
  DE: { defaultLabel: 'Nächste Stunde', join: 'Zur Stunde' },
};

export default function NextSessionCard({ darkMode, currentLang }: { darkMode: boolean; currentLang: Locale }) {
  const { user } = useAuth();
  const t = T[currentLang];
  const session = readNextSession(user?.app_metadata?.nextSession);

  // Rien à afficher si l'école n'a pas encore renseigné de séance, ou si la
  // dernière renseignée est déjà passée (évite un vieux lien Zoom qui traîne).
  if (!session || new Date(session.dateTime).getTime() < Date.now() - 2 * 60 * 60 * 1000) return null;

  const formattedDate = new Intl.DateTimeFormat(DATE_LOCALE[currentLang], { dateStyle: 'full', timeStyle: 'short' }).format(new Date(session.dateTime));

  return (
    <div className={`mb-8 rounded-2xl border-2 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${darkMode ? 'bg-indigo-900/20 border-indigo-700' : 'bg-indigo-50 border-indigo-200'}`}>
      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-indigo-600' : 'bg-[#232999]'}`}>
        <i className="ri-vidicon-line text-2xl text-white"></i>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-indigo-300' : 'text-[#232999]'}`}>{session.label || t.defaultLabel}</p>
        <p className={`text-sm mt-0.5 capitalize ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{formattedDate}</p>
      </div>
      <a
        href={session.joinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 w-full sm:w-auto text-center bg-[#232999] hover:bg-[#1a1f7a] text-white px-6 py-3 rounded-full text-sm font-semibold transition-all whitespace-nowrap"
      >
        {t.join} →
      </a>
    </div>
  );
}
