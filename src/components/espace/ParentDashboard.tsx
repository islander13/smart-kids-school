import { useCallback, useEffect, useState } from 'react';
import type { Locale } from '../../i18n/routing';
import { useAuth } from '../../contexts/AuthContext';
import { ESPACE_SECTIONS } from '../../data/espaceContent';
import { getSectionProgress, getTotalProgress, type EspaceProgress } from '../../utils/progress';
import ProgressBar from './ProgressBar';
import LinkChildForm from './LinkChildForm';
import SectionBadge from './SectionBadge';
import RoleSwitcher from './RoleSwitcher';
import NextSessionCard from './NextSessionCard';

interface ChildSummary {
  id: string;
  email: string;
  watched: string[];
  badges: Record<string, string>;
  lastActivityAt: string | null;
}

const DATE_LOCALE: Record<Locale, string> = { FR: 'fr-CH', EN: 'en-GB', DE: 'de-CH' };

const T: Record<Locale, {
  title: string; myProgress: string; linkedIntro: string;
  loading: string; error: string;
  overall: string; lastActivity: string; never: string; badges: string;
}> = {
  FR: {
    title: 'Suivi de progression',
    myProgress: 'Ma progression',
    linkedIntro: "Vous suivez plusieurs enfants qui ont chacun leur propre compte ? Liez-les ici pour voir leur progression aussi.",
    loading: 'Chargement…',
    error: 'Impossible de charger la progression pour le moment.',
    overall: 'Progression totale',
    lastActivity: 'Dernière activité',
    never: 'Aucune activité pour le moment',
    badges: 'Badges obtenus',
  },
  EN: {
    title: 'Progress tracking',
    myProgress: 'My progress',
    linkedIntro: 'Tracking several children who each have their own account? Link them here to see their progress too.',
    loading: 'Loading…',
    error: 'Could not load progress right now.',
    overall: 'Overall progress',
    lastActivity: 'Last activity',
    never: 'No activity yet',
    badges: 'Badges earned',
  },
  DE: {
    title: 'Fortschrittsverfolgung',
    myProgress: 'Mein Fortschritt',
    linkedIntro: 'Verfolgen Sie mehrere Kinder mit je einem eigenen Konto? Verknüpfen Sie sie hier, um auch ihren Fortschritt zu sehen.',
    loading: 'Wird geladen…',
    error: 'Der Fortschritt konnte gerade nicht geladen werden.',
    overall: 'Gesamtfortschritt',
    lastActivity: 'Letzte Aktivität',
    never: 'Noch keine Aktivität',
    badges: 'Erhaltene Abzeichen',
  },
};

function ProgressCard({ label, progress, lastActivityAt, darkMode, currentLang, t, formatDate }: {
  label: string;
  progress: EspaceProgress;
  lastActivityAt: string | null | undefined;
  darkMode: boolean;
  currentLang: Locale;
  t: (typeof T)['FR'];
  formatDate: (iso: string | null) => string;
}) {
  const { watchedCount, totalCount } = getTotalProgress(ESPACE_SECTIONS, progress);
  const badgeEntries = Object.entries(progress.badges || {});

  return (
    <div className={`p-6 rounded-2xl border-2 ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white shadow-sm'}`}>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h2 className={`font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <i className="ri-graduation-cap-line"></i>{label}
        </h2>
        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {t.lastActivity} : {formatDate(lastActivityAt ?? null)}
        </span>
      </div>

      <div className="mb-5">
        <p className={`text-xs font-semibold uppercase tracking-wide mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.overall}</p>
        <ProgressBar watched={watchedCount} total={totalCount} darkMode={darkMode} />
      </div>

      <div className="space-y-3">
        {ESPACE_SECTIONS.filter(s => s.videos.length > 0).map(section => {
          const { watchedCount: sw, totalCount: st } = getSectionProgress(section, progress);
          return (
            <div key={section.key}>
              <p className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{section.title[currentLang]}</p>
              <ProgressBar watched={sw} total={st} darkMode={darkMode} />
            </div>
          );
        })}
      </div>

      {badgeEntries.length > 0 && (
        <div className="mt-5">
          <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.badges}</p>
          <div className="flex flex-wrap gap-3">
            {badgeEntries.map(([sectionKey, unlockedAt]) => {
              const section = ESPACE_SECTIONS.find(s => s.key === sectionKey);
              if (!section) return null;
              return (
                <SectionBadge key={sectionKey} sectionTitle={section.title[currentLang]} unlockedAt={unlockedAt} darkMode={darkMode} currentLang={currentLang} />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ParentDashboard({ darkMode, currentLang }: { darkMode: boolean; currentLang: Locale }) {
  const t = T[currentLang];
  const { user, role, progress } = useAuth();
  const [children, setChildren] = useState<ChildSummary[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setError(false);
    try {
      const token = await user.jwt();
      const res = await fetch('/.netlify/functions/children-progress', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('fetch_failed');
      const data = await res.json();
      setChildren(Array.isArray(data.children) ? data.children : []);
    } catch {
      setError(true);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const formatDate = (iso: string | null) => {
    if (!iso) return t.never;
    try {
      return new Intl.DateTimeFormat(DATE_LOCALE[currentLang], { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
    } catch {
      return t.never;
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <h1 className={`text-3xl lg:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.title}</h1>
        {role && <RoleSwitcher currentRole={role} darkMode={darkMode} currentLang={currentLang} />}
      </div>

      <NextSessionCard darkMode={darkMode} currentLang={currentLang} />

      <div className="space-y-6 mb-10">
        {/* Le compte connecté a toujours sa propre progression : dans une famille avec un
            seul email (le cas le plus courant), c'est directement celle de l'enfant qui
            utilise ce compte — pas besoin de lier quoi que ce soit. */}
        <ProgressCard label={t.myProgress} progress={progress} lastActivityAt={progress.lastActivityAt} darkMode={darkMode} currentLang={currentLang} t={t} formatDate={formatDate} />

        {children === null && !error ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-4 border-[#232999] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <i className="ri-error-warning-line mr-1"></i>{t.error}
          </div>
        ) : (
          children.map(child => {
            const childProgress: EspaceProgress = { watched: child.watched, badges: child.badges };
            return (
              <ProgressCard key={child.id} label={child.email} progress={childProgress} lastActivityAt={child.lastActivityAt} darkMode={darkMode} currentLang={currentLang} t={t} formatDate={formatDate} />
            );
          })
        )}
      </div>

      <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.linkedIntro}</p>
      <LinkChildForm darkMode={darkMode} currentLang={currentLang} onLinked={load} />
    </div>
  );
}
