import { useState } from 'react';
import type { Locale } from '../../i18n/routing';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ForgotPasswordForm from './ForgotPasswordForm';

type Mode = 'login' | 'signup' | 'forgot';

const T: Record<Locale, {
  loginTitle: string; signupTitle: string; forgotTitle: string;
  confirmationSentTitle: string; confirmationSentBody: string; backToLogin: string;
}> = {
  FR: {
    loginTitle: 'Connexion à mon espace', signupTitle: 'Créer mon compte', forgotTitle: 'Mot de passe oublié',
    confirmationSentTitle: 'Vérifiez votre boîte mail',
    confirmationSentBody: "Un email de confirmation vous a été envoyé. Cliquez sur le lien qu'il contient, puis revenez ici pour vous connecter.",
    backToLogin: '← Retour à la connexion',
  },
  EN: {
    loginTitle: 'Log in to my space', signupTitle: 'Create my account', forgotTitle: 'Forgot password',
    confirmationSentTitle: 'Check your inbox',
    confirmationSentBody: 'A confirmation email has been sent. Click the link inside, then come back here to log in.',
    backToLogin: '← Back to login',
  },
  DE: {
    loginTitle: 'Anmeldung zu Mein Bereich', signupTitle: 'Konto erstellen', forgotTitle: 'Passwort vergessen',
    confirmationSentTitle: 'Prüfen Sie Ihr Postfach',
    confirmationSentBody: 'Eine Bestätigungs-E-Mail wurde gesendet. Klicken Sie auf den enthaltenen Link und kehren Sie dann hierher zurück, um sich anzumelden.',
    backToLogin: '← Zurück zur Anmeldung',
  },
};

export default function AuthPanel({ darkMode, currentLang }: { darkMode: boolean; currentLang: Locale }) {
  const t = T[currentLang];
  const { settings } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [confirmationSent, setConfirmationSent] = useState(false);

  const title = confirmationSent ? t.confirmationSentTitle : mode === 'login' ? t.loginTitle : mode === 'signup' ? t.signupTitle : t.forgotTitle;

  return (
    <div className={`max-w-md mx-auto rounded-3xl border-2 p-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-lg'}`}>
      <h1 className={`text-2xl font-bold mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h1>

      {confirmationSent ? (
        <div>
          <div className={`p-4 rounded-xl text-sm text-center mb-5 ${darkMode ? 'bg-emerald-900/20 text-emerald-300' : 'bg-emerald-50 text-emerald-800'}`}>
            <i className="ri-mail-check-line mr-1"></i>{t.confirmationSentBody}
          </div>
          <button type="button" onClick={() => { setConfirmationSent(false); setMode('login'); }} className={`w-full text-center text-sm font-medium hover:underline cursor-pointer ${darkMode ? 'text-indigo-400' : 'text-[#232999]'}`}>
            {t.backToLogin}
          </button>
        </div>
      ) : mode === 'login' ? (
        <LoginForm darkMode={darkMode} currentLang={currentLang} onSwitchToSignup={() => setMode('signup')} onSwitchToForgot={() => setMode('forgot')} />
      ) : mode === 'signup' ? (
        <SignupForm darkMode={darkMode} currentLang={currentLang} disabled={settings?.disable_signup ?? false} onSwitchToLogin={() => setMode('login')} onConfirmationSent={() => setConfirmationSent(true)} />
      ) : (
        <ForgotPasswordForm darkMode={darkMode} currentLang={currentLang} onBackToLogin={() => setMode('login')} />
      )}
    </div>
  );
}
