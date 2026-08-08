import { useState } from 'react';
import type { Locale } from '../../i18n/routing';
import { useAuth, type EspaceRole } from '../../contexts/AuthContext';

const T: Record<Locale, {
  title: string; subtitle: string;
  student: string; studentDesc: string;
  parent: string; parentDesc: string;
  error: string;
}> = {
  FR: {
    title: 'Bienvenue !', subtitle: 'Pour commencer, dites-nous qui vous êtes.',
    student: "Je suis l'élève", studentDesc: 'Accès aux vidéos de cours et à ma progression.',
    parent: 'Je suis parent', parentDesc: "Suivi de la progression de mon enfant, sans accès aux vidéos.",
    error: "Une erreur est survenue. Réessayez.",
  },
  EN: {
    title: 'Welcome!', subtitle: "To get started, let us know who you are.",
    student: "I'm the student", studentDesc: 'Access to class videos and my progress.',
    parent: "I'm a parent", parentDesc: "Follow my child's progress, without access to the videos.",
    error: 'Something went wrong. Please try again.',
  },
  DE: {
    title: 'Willkommen!', subtitle: 'Sagen Sie uns zunächst, wer Sie sind.',
    student: 'Ich bin die Schülerin/der Schüler', studentDesc: 'Zugang zu den Kursvideos und meinem Fortschritt.',
    parent: 'Ich bin ein Elternteil', parentDesc: 'Verfolgen Sie den Fortschritt Ihres Kindes, ohne Zugriff auf die Videos.',
    error: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
  },
};

export default function RoleSelector({ darkMode, currentLang }: { darkMode: boolean; currentLang: Locale }) {
  const t = T[currentLang];
  const { setRole } = useAuth();
  const [submitting, setSubmitting] = useState<EspaceRole | null>(null);
  const [error, setError] = useState(false);

  const choose = async (role: EspaceRole) => {
    setSubmitting(role);
    setError(false);
    try {
      await setRole(role);
    } catch {
      setError(true);
    } finally {
      setSubmitting(null);
    }
  };

  const cardClass = `text-left p-6 rounded-2xl border-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${darkMode ? 'border-gray-700 bg-gray-800/50 hover:border-indigo-400' : 'border-gray-200 bg-white hover:border-[#232999] hover:shadow-lg'}`;

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.title}</h1>
      <p className={`text-sm mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.subtitle}</p>

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <i className="ri-error-warning-line mr-1"></i>{t.error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        <button type="button" disabled={submitting !== null} onClick={() => choose('student')} className={cardClass}>
          <i className={`ri-graduation-cap-line text-3xl mb-3 block ${darkMode ? 'text-indigo-400' : 'text-[#232999]'}`}></i>
          <h2 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{submitting === 'student' ? '…' : t.student}</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.studentDesc}</p>
        </button>
        <button type="button" disabled={submitting !== null} onClick={() => choose('parent')} className={cardClass}>
          <i className="ri-user-heart-line text-3xl mb-3 block text-[#d99a2b]"></i>
          <h2 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{submitting === 'parent' ? '…' : t.parent}</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.parentDesc}</p>
        </button>
      </div>
    </div>
  );
}
