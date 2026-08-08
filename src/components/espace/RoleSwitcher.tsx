import { useState } from 'react';
import type { Locale } from '../../i18n/routing';
import { useAuth, type EspaceRole } from '../../contexts/AuthContext';

const T: Record<Locale, { student: string; parent: string }> = {
  FR: { student: 'Élève', parent: 'Parent' },
  EN: { student: 'Student', parent: 'Parent' },
  DE: { student: 'Schüler:in', parent: 'Elternteil' },
};

// Beaucoup de familles n'ont qu'un seul email (celui du parent) — l'enfant
// n'en a souvent pas encore. Le choix élève/parent n'est donc pas une
// identité figée liée à un compte distinct, mais une simple vue que
// n'importe qui utilisant ce compte peut changer à tout moment. Le rôle
// choisi reste néanmoins mémorisé (écrit dans user_metadata) pour
// retrouver la même vue à la prochaine visite.
export default function RoleSwitcher({ currentRole, darkMode, currentLang }: {
  currentRole: EspaceRole;
  darkMode: boolean;
  currentLang: Locale;
}) {
  const t = T[currentLang];
  const { setRole } = useAuth();
  const [pending, setPending] = useState<EspaceRole | null>(null);

  const switchTo = async (role: EspaceRole) => {
    if (role === currentRole || pending) return;
    setPending(role);
    try {
      await setRole(role);
    } finally {
      setPending(null);
    }
  };

  const baseClass = 'px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed';
  const activeClass = 'bg-[#232999] text-white';
  const inactiveClass = darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100';

  return (
    <div className={`inline-flex items-center gap-1 p-1 rounded-full border flex-shrink-0 ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
      <button type="button" disabled={pending !== null} onClick={() => switchTo('student')} className={`${baseClass} ${currentRole === 'student' ? activeClass : inactiveClass}`}>
        <i className="ri-graduation-cap-line mr-1.5"></i>{t.student}
      </button>
      <button type="button" disabled={pending !== null} onClick={() => switchTo('parent')} className={`${baseClass} ${currentRole === 'parent' ? activeClass : inactiveClass}`}>
        <i className="ri-user-heart-line mr-1.5"></i>{t.parent}
      </button>
    </div>
  );
}
