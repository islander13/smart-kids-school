import { useState } from 'react';
import type { Locale } from '../../i18n/routing';
import { useAuth } from '../../contexts/AuthContext';

const T: Record<Locale, {
  intro: string; email: string; submit: string; submitting: string;
  backToLogin: string; genericError: string; sent: string;
}> = {
  FR: {
    intro: "Indiquez votre email : nous vous envoyons un lien pour réinitialiser votre mot de passe.",
    email: 'Email', submit: 'Envoyer le lien', submitting: 'Envoi…', backToLogin: '← Retour à la connexion',
    genericError: "Impossible d'envoyer l'email. Vérifiez l'adresse et réessayez.",
    sent: 'Email envoyé ! Vérifiez votre boîte de réception (et vos spams) pour la suite.',
  },
  EN: {
    intro: "Enter your email: we'll send you a link to reset your password.",
    email: 'Email', submit: 'Send link', submitting: 'Sending…', backToLogin: '← Back to login',
    genericError: 'Could not send the email. Check the address and try again.',
    sent: "Email sent! Check your inbox (and spam folder) for the next step.",
  },
  DE: {
    intro: 'Geben Sie Ihre E-Mail-Adresse ein: Wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.',
    email: 'E-Mail', submit: 'Link senden', submitting: 'Wird gesendet…', backToLogin: '← Zurück zur Anmeldung',
    genericError: 'E-Mail konnte nicht gesendet werden. Adresse prüfen und erneut versuchen.',
    sent: 'E-Mail gesendet! Prüfen Sie Ihren Posteingang (und Spam-Ordner) für die nächsten Schritte.',
  },
};

export default function ForgotPasswordForm({ darkMode, currentLang, onBackToLogin }: {
  darkMode: boolean;
  currentLang: Locale;
  onBackToLogin: () => void;
}) {
  const t = T[currentLang];
  const { requestPasswordRecovery } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const inputClass = `w-full px-4 py-3 rounded-xl border focus:border-[#232999] focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`;
  const labelClass = `block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`;

  if (sent) {
    return (
      <div>
        <div className={`p-4 rounded-xl text-sm text-center mb-5 ${darkMode ? 'bg-emerald-900/20 text-emerald-300' : 'bg-emerald-50 text-emerald-800'}`}>
          <i className="ri-mail-check-line mr-1"></i>{t.sent}
        </div>
        <button type="button" onClick={onBackToLogin} className={`w-full text-center text-sm font-medium hover:underline cursor-pointer ${darkMode ? 'text-indigo-400' : 'text-[#232999]'}`}>
          {t.backToLogin}
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await requestPasswordRecovery(email);
      setSent(true);
    } catch {
      setError(t.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p className={`text-sm mb-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.intro}</p>
      <div className="mb-5">
        <label htmlFor="forgot-email" className={labelClass}>{t.email}</label>
        <input id="forgot-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <i className="ri-error-warning-line mr-1"></i>{error}
        </div>
      )}

      <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-[#232999] to-indigo-600 text-white px-6 py-3 rounded-full font-bold hover:shadow-xl transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
        {submitting ? t.submitting : t.submit}
      </button>

      <button type="button" onClick={onBackToLogin} className={`w-full text-center text-sm font-medium mt-5 hover:underline cursor-pointer ${darkMode ? 'text-indigo-400' : 'text-[#232999]'}`}>
        {t.backToLogin}
      </button>
    </form>
  );
}
