import { useState } from 'react';
import type { Locale } from '../../i18n/routing';
import { useAuth } from '../../contexts/AuthContext';

const T: Record<Locale, {
  email: string; password: string; submit: string; submitting: string;
  forgot: string; noAccount: string; signupCta: string; genericError: string;
}> = {
  FR: { email: 'Email', password: 'Mot de passe', submit: 'Se connecter', submitting: 'Connexion…', forgot: 'Mot de passe oublié ?', noAccount: "Pas encore de compte ?", signupCta: 'Créer un compte', genericError: "Email ou mot de passe incorrect." },
  EN: { email: 'Email', password: 'Password', submit: 'Log in', submitting: 'Logging in…', forgot: 'Forgot your password?', noAccount: "Don't have an account?", signupCta: 'Create an account', genericError: 'Incorrect email or password.' },
  DE: { email: 'E-Mail', password: 'Passwort', submit: 'Anmelden', submitting: 'Anmeldung…', forgot: 'Passwort vergessen?', noAccount: 'Noch kein Konto?', signupCta: 'Konto erstellen', genericError: 'Falsche E-Mail oder falsches Passwort.' },
};

export default function LoginForm({ darkMode, currentLang, onSwitchToSignup, onSwitchToForgot }: {
  darkMode: boolean;
  currentLang: Locale;
  onSwitchToSignup: () => void;
  onSwitchToForgot: () => void;
}) {
  const t = T[currentLang];
  const { logIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await logIn(email, password);
    } catch {
      setError(t.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border focus:border-[#232999] focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`;
  const labelClass = `block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="login-email" className={labelClass}>{t.email}</label>
        <input id="login-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
      </div>
      <div className="mb-2">
        <label htmlFor="login-password" className={labelClass}>{t.password}</label>
        <input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
      </div>
      <div className="text-right mb-5">
        <button type="button" onClick={onSwitchToForgot} className={`text-xs font-medium hover:underline cursor-pointer ${darkMode ? 'text-indigo-400' : 'text-[#232999]'}`}>
          {t.forgot}
        </button>
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
        {t.noAccount}{' '}
        <button type="button" onClick={onSwitchToSignup} className={`font-semibold hover:underline cursor-pointer ${darkMode ? 'text-indigo-400' : 'text-[#232999]'}`}>
          {t.signupCta}
        </button>
      </p>
    </form>
  );
}
