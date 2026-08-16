import { useCallback, useEffect, useState } from 'react';
import type { Locale } from '../../i18n/routing';
import { useAuth } from '../../contexts/AuthContext';

interface MyCertificate {
  studentName: string;
  courseLabel: string;
  langLabel: string;
  issuedDate: string;
  openUrl: string;
  /** 'own' pour le compte connecté, sinon l'email de l'enfant lié concerné. */
  owner: string;
}

const DATE_LOCALE: Record<Locale, string> = { FR: 'fr-CH', EN: 'en-GB', DE: 'de-CH' };

const T: Record<Locale, { title: string; loading: string; error: string; forChild: string }> = {
  FR: { title: 'Mes certificats', loading: 'Chargement…', error: 'Impossible de charger les certificats pour le moment.', forChild: 'Pour' },
  EN: { title: 'My certificates', loading: 'Loading…', error: 'Could not load certificates right now.', forChild: 'For' },
  DE: { title: 'Meine Zertifikate', loading: 'Wird geladen…', error: 'Die Zertifikate konnten gerade nicht geladen werden.', forChild: 'Für' },
};

export default function MyCertificates({ darkMode, currentLang }: {
  darkMode: boolean;
  currentLang: Locale;
}) {
  const t = T[currentLang];
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<MyCertificate[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setError(false);
    try {
      const token = await user.jwt();
      const res = await fetch('/.netlify/functions/list-my-certificates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('fetch_failed');
      const data = await res.json();
      setCertificates(Array.isArray(data.certificates) ? data.certificates : []);
    } catch {
      setError(true);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat(DATE_LOCALE[currentLang], { dateStyle: 'long' }).format(new Date(iso + 'T12:00:00'));
    } catch {
      return iso;
    }
  };

  // Rien de reçu, aucune erreur, aucun certificat : pas de section vide à
  // afficher tant que l'élève n'a rien obtenu — évite un bloc "Mes
  // certificats" vide et un peu triste dès la première connexion.
  if (certificates !== null && !error && certificates.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className={`text-sm font-bold uppercase tracking-wide mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.title}</h3>
      {certificates === null && !error ? (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-4 border-[#232999] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <i className="ri-error-warning-line mr-1"></i>{t.error}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {certificates.map((cert, i) => (
            <a
              key={i}
              href={cert.openUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all hover:shadow-md ${darkMode ? 'border-gray-700 bg-gray-800/50 hover:border-indigo-400' : 'border-gray-200 bg-white hover:border-[#232999]'}`}
            >
              <i className={`ri-award-line text-2xl flex-shrink-0 ${darkMode ? 'text-indigo-400' : 'text-[#232999]'}`}></i>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{cert.courseLabel}</p>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{cert.studentName} · {formatDate(cert.issuedDate)}</p>
                {cert.owner !== 'own' && (
                  <p className={`text-xs mt-1 font-medium ${darkMode ? 'text-indigo-400' : 'text-[#232999]'}`}>{t.forChild} {cert.owner}</p>
                )}
              </div>
              <i className={`ri-download-2-line flex-shrink-0 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}></i>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
