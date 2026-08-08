import type { Locale } from '../../i18n/routing';

const DATE_LOCALE: Record<Locale, string> = { FR: 'fr-CH', EN: 'en-GB', DE: 'de-CH' };

const T: Record<Locale, { earned: string }> = {
  FR: { earned: 'Badge obtenu le' },
  EN: { earned: 'Badge earned on' },
  DE: { earned: 'Abzeichen erhalten am' },
};

export default function SectionBadge({ sectionTitle, unlockedAt, darkMode, currentLang }: {
  sectionTitle: string;
  unlockedAt: string;
  darkMode: boolean;
  currentLang: Locale;
}) {
  const t = T[currentLang];
  let dateLabel = unlockedAt;
  try {
    dateLabel = new Intl.DateTimeFormat(DATE_LOCALE[currentLang], { dateStyle: 'long' }).format(new Date(unlockedAt));
  } catch {
    // conserve la valeur brute si la date est mal formée
  }

  return (
    <div className={`mb-4 inline-flex items-center gap-3 px-4 py-3 rounded-2xl border-2 ${darkMode ? 'border-[#d99a2b]/50 bg-[#d99a2b]/10' : 'border-[#d99a2b]/40 bg-[#d99a2b]/10'}`}>
      <i className="ri-medal-line text-2xl text-[#d99a2b]"></i>
      <div>
        <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{sectionTitle}</p>
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.earned} {dateLabel}</p>
      </div>
    </div>
  );
}
