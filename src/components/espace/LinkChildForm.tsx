import { useState } from 'react';
import type { Locale } from '../../i18n/routing';
import { useAuth } from '../../contexts/AuthContext';

const T: Record<Locale, {
  title: string; emailLabel: string; submit: string; submitting: string; success: string;
  errors: Record<string, string>;
}> = {
  FR: {
    title: 'Lier le compte de mon enfant',
    emailLabel: 'Email du compte de votre enfant',
    submit: 'Lier ce compte', submitting: 'Liaison…',
    success: 'Compte lié avec succès !',
    errors: {
      child_not_found: "Aucun compte ne correspond à cet email. Vérifiez qu'il a bien créé son compte.",
      cannot_link_self: 'Vous ne pouvez pas vous lier à votre propre compte.',
      link_failed: 'Une erreur est survenue. Réessayez.',
      server_error: 'Une erreur est survenue. Réessayez.',
      unauthorized: 'Session expirée, reconnectez-vous.',
    },
  },
  EN: {
    title: "Link your child's account",
    emailLabel: "Your child's account email",
    submit: 'Link this account', submitting: 'Linking…',
    success: 'Account linked successfully!',
    errors: {
      child_not_found: 'No account matches this email. Make sure they created their account first.',
      cannot_link_self: 'You cannot link to your own account.',
      link_failed: 'Something went wrong. Please try again.',
      server_error: 'Something went wrong. Please try again.',
      unauthorized: 'Session expired, please log in again.',
    },
  },
  DE: {
    title: 'Konto Ihres Kindes verknüpfen',
    emailLabel: 'E-Mail des Kontos Ihres Kindes',
    submit: 'Konto verknüpfen', submitting: 'Wird verknüpft…',
    success: 'Konto erfolgreich verknüpft!',
    errors: {
      child_not_found: 'Kein Konto mit dieser E-Mail gefunden. Stellen Sie sicher, dass es bereits erstellt wurde.',
      cannot_link_self: 'Sie können sich nicht mit Ihrem eigenen Konto verknüpfen.',
      link_failed: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
      server_error: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
      unauthorized: 'Sitzung abgelaufen, bitte erneut anmelden.',
    },
  },
};

export default function LinkChildForm({ darkMode, currentLang, onLinked }: {
  darkMode: boolean;
  currentLang: Locale;
  onLinked: () => void;
}) {
  const t = T[currentLang];
  const { linkChild } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const inputClass = `w-full px-4 py-3 rounded-xl border focus:border-[#232999] focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      await linkChild(email);
      setEmail('');
      setSuccess(true);
      onLinked();
    } catch (err) {
      const code = err instanceof Error ? err.message : 'link_failed';
      setError(t.errors[code] || t.errors.link_failed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`p-6 rounded-2xl border-2 ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'}`}>
      <h3 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        <i className="ri-mail-line"></i>{t.title}
      </h3>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          placeholder={t.emailLabel}
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={`${inputClass} flex-1`}
        />
        <button type="submit" disabled={submitting} className="px-6 py-3 rounded-full font-bold text-sm text-white bg-gradient-to-r from-[#232999] to-indigo-600 hover:shadow-lg transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap">
          {submitting ? t.submitting : t.submit}
        </button>
      </div>
      {error && (
        <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <i className="ri-error-warning-line mr-1"></i>{error}
        </div>
      )}
      {success && !error && (
        <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          <i className="ri-check-line mr-1"></i>{t.success}
        </div>
      )}
    </form>
  );
}
