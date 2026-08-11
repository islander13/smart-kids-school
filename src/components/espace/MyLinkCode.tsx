import { useEffect, useState } from 'react';
import type { Locale } from '../../i18n/routing';
import { useAuth } from '../../contexts/AuthContext';

// ─────────────────────────────────────────────────────────────────────────
// Affiche le code de liaison du compte CONNECTÉ (jamais celui d'un autre
// compte — get-link-code.js ne renvoie que le code de l'appelant). Un
// parent qui veut suivre la progression de son enfant (compte séparé) doit
// obtenir ce code directement auprès de l'enfant, pas juste connaître son
// email — c'est ce qui empêche un compte quelconque de se lier à n'importe
// quel autre en devinant une adresse (voir link-child.js).
// ─────────────────────────────────────────────────────────────────────────

const T: Record<Locale, { title: string; desc: string; loading: string; error: string; copy: string; copied: string }> = {
  FR: {
    title: 'Votre code de liaison',
    desc: "Pour qu'un parent (ou une autre personne) suive votre progression depuis son propre compte, communiquez-lui ce code.",
    loading: 'Chargement…',
    error: 'Impossible de charger le code pour le moment.',
    copy: 'Copier',
    copied: 'Copié !',
  },
  EN: {
    title: 'Your linking code',
    desc: 'For a parent (or someone else) to follow your progress from their own account, share this code with them.',
    loading: 'Loading…',
    error: 'Could not load the code right now.',
    copy: 'Copy',
    copied: 'Copied!',
  },
  DE: {
    title: 'Ihr Verknüpfungscode',
    desc: 'Damit ein Elternteil (oder eine andere Person) Ihren Fortschritt von seinem eigenen Konto aus verfolgen kann, teilen Sie ihm diesen Code mit.',
    loading: 'Wird geladen…',
    error: 'Der Code konnte gerade nicht geladen werden.',
    copy: 'Kopieren',
    copied: 'Kopiert!',
  },
};

export default function MyLinkCode({ darkMode, currentLang }: { darkMode: boolean; currentLang: Locale }) {
  const t = T[currentLang];
  const { user } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!user) return;
    setError(false);
    user.jwt()
      .then(token => fetch('/.netlify/functions/get-link-code', { headers: { Authorization: `Bearer ${token}` } }))
      .then(res => { if (!res.ok) throw new Error('failed'); return res.json(); })
      .then(data => { if (!cancelled) setCode(data.code); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [user]);

  // Copier plutôt que retaper à la main : évite le tiret oublié ou la faute
  // de frappe la plus probable en recopiant le code depuis un SMS/appel.
  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <div className={`mb-8 p-5 rounded-2xl border-2 flex items-center gap-4 flex-wrap ${darkMode ? 'border-gray-700 bg-gray-800/40' : 'border-gray-200 bg-gray-50'}`}>
      <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-white shadow-sm'}`}>
        <i className={`ri-key-2-line text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}></i>
      </div>
      <div className="flex-1 min-w-[200px]">
        <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.title}</p>
        <p className={`text-xs leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.desc}</p>
      </div>
      {error ? (
        <span className="text-sm text-red-500">{t.error}</span>
      ) : (
        <div className="flex-shrink-0 flex items-center gap-2">
          <span className={`px-4 py-2 rounded-xl font-mono font-bold tracking-widest text-lg ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900 border border-gray-200'}`}>
            {code || t.loading}
          </span>
          {code && (
            <button
              type="button"
              onClick={handleCopy}
              className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
            >
              {copied ? t.copied : t.copy}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
