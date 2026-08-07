import { useState } from 'react';
import type { Locale } from '../../i18n/routing';
import { useAuth } from '../../contexts/AuthContext';

const T: Record<Locale, {
  email: string; password: string; passwordConfirm: string; submit: string; submitting: string;
  hasAccount: string; loginCta: string; mismatchError: string; genericError: string;
  confirmationSent: string; disabledSignup: string;
}> = {
  FR: {
    email: 'Email', password: 'Mot de passe', passwordConfirm: 'Confirmer le mot de passe',
    submit: 'Créer mon compte', submitting: 'Création…', hasAccount: 'Déjà un compte ?', loginCta: 'Se connecter',
    mismatchError: 'Les mots de passe ne correspondent pas.',
    genericError: "L'inscription a échoué. Vérifiez vos informations ou réessayez.",
    confirmationSent: "Compte créé ! Vérifiez votre boîte mail pour confirmer votre adresse avant de vous connecter.",
    disabledSignup: "Les inscriptions se font actuellement sur invitation. Contactez-nous à contact@smartkids-school.ch pour obtenir un accès.",
  },
  EN: {
    email: 'Email', password: 'Password', passwordConfirm: 'Confirm password',
    submit: 'Create my account', submitting: 'Creating…', hasAccount: 'Already have an account?', loginCta: 'Log in',
    mismatchError: 'Passwords do not match.',
    genericError: 'Sign-up failed. Check your details or try again.',
    confirmationSent: 'Account created! Check your inbox to confirm your email before logging in.',
    disabledSignup: 'Sign-ups are currently invite-only. Contact us at contact@smartkids-school.ch to get access.',
  },
  DE: {
    email: 'E-Mail', password: 'Passwort', passwordConfirm: 'Passwort bestätigen',
    submit: 'Konto erstellen', submitting: 'Wird erstellt…', hasAccount: 'Bereits ein Konto?', loginCta: 'Anmelden',
    mismatchError: 'Die Passwörter stimmen nicht überein.',
    genericError: 'Registrierung fehlgeschlagen. Bitte Angaben prüfen oder erneut versuchen.',
    confirmationSent: 'Konto erstellt! Bitte bestätigen Sie Ihre E-Mail-Adresse über den Link in Ihrem Postfach, bevor Sie sich anmelden.',
    disabledSignup: 'Registrierungen erfolgen derzeit nur auf Einladung. Kontaktieren Sie uns unter contact@smartkids-school.ch für einen Zugang.',
  },
};

export default function SignupForm({ darkMode, currentLang, disabled, onSwitchToLogin, onConfirmationSent }: {
  darkMode: boolean;
  currentLang: Locale;
  /** true si settings().disable_signup côté Identity — masque le formulaire. */
  disabled: boolean;
  onSwitchToLogin: () => void;
  onConfirmationSent: () => void;
}) {
  const t = T[currentLang];
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass = `w-full px-4 py-3 rounded-xl border focus:border-[#232999] focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`;
  const labelClass = `block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`;

  if (disabled) {
    return (
      <div className={`p-4 rounded-xl text-sm text-center ${darkMode ? 'bg-amber-900/20 text-amber-300' : 'bg-amber-50 text-amber-800'}`}>
        <i className="ri-mail-line mr-1"></i>{t.disabledSignup}
        <div className="mt-4">
          <button type="button" onClick={onSwitchToLogin} className={`font-semibold hover:underline cursor-pointer ${darkMode ? 'text-indigo-400' : 'text-[#232999]'}`}>
            {t.loginCta}
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setError(t.mismatchError);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { needsConfirmation } = await signUp(email, password);
      if (needsConfirmation) {
        onConfirmationSent();
      }
      // Si needsConfirmation est false, signUp() a déjà connecté
      // l'utilisateur — AuthContext.user change et la page bascule seule.
    } catch {
      setError(t.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="signup-email" className={labelClass}>{t.email}</label>
        <input id="signup-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
      </div>
      <div className="mb-4">
        <label htmlFor="signup-password" className={labelClass}>{t.password}</label>
        <input id="signup-password" type="password" autoComplete="new-password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
      </div>
      <div className="mb-5">
        <label htmlFor="signup-password-confirm" className={labelClass}>{t.passwordConfirm}</label>
        <input id="signup-password-confirm" type="password" autoComplete="new-password" required minLength={6} value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} className={inputClass} />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <i className="ri-error-warning-line mr-1"></i>{error}
        </div>
      )}

      <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-[#232999] to-indigo-600 text-white px-6 py-3 rounded-full font-bold hover:shadow-xl transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
        {submitting ? t.submitting : t.submit}
      </button>

      <p className={`text-center text-sm mt-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {t.hasAccount}{' '}
        <button type="button" onClick={onSwitchToLogin} className={`font-semibold hover:underline cursor-pointer ${darkMode ? 'text-indigo-400' : 'text-[#232999]'}`}>
          {t.loginCta}
        </button>
      </p>
    </form>
  );
}
