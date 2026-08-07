import { useState } from 'react';
import type { Locale } from '../../i18n/routing';
import { useAuth } from '../../contexts/AuthContext';

const T: Record<Locale, {
  introRecovery: string; introInvite: string;
  password: string; passwordConfirm: string; submit: string; submitting: string;
  mismatchError: string; genericErrorRecovery: string; genericErrorInvite: string;
}> = {
  FR: {
    introRecovery: 'Choisissez votre nouveau mot de passe.',
    introInvite: 'Bienvenue ! Choisissez votre mot de passe pour activer votre compte.',
    password: 'Mot de passe', passwordConfirm: 'Confirmer le mot de passe',
    submit: 'Valider', submitting: 'Enregistrement…',
    mismatchError: 'Les mots de passe ne correspondent pas.',
    genericErrorRecovery: "Le lien a peut-être expiré. Refaites une demande de réinitialisation.",
    genericErrorInvite: "Ce lien d'invitation n'est plus valide. Demandez une nouvelle invitation.",
  },
  EN: {
    introRecovery: 'Choose your new password.',
    introInvite: 'Welcome! Choose your password to activate your account.',
    password: 'Password', passwordConfirm: 'Confirm password',
    submit: 'Confirm', submitting: 'Saving…',
    mismatchError: 'Passwords do not match.',
    genericErrorRecovery: 'The link may have expired. Request a new reset link.',
    genericErrorInvite: 'This invitation link is no longer valid. Ask for a new invite.',
  },
  DE: {
    introRecovery: 'Wählen Sie Ihr neues Passwort.',
    introInvite: 'Willkommen! Wählen Sie Ihr Passwort, um Ihr Konto zu aktivieren.',
    password: 'Passwort', passwordConfirm: 'Passwort bestätigen',
    submit: 'Bestätigen', submitting: 'Wird gespeichert…',
    mismatchError: 'Die Passwörter stimmen nicht überein.',
    genericErrorRecovery: 'Der Link ist möglicherweise abgelaufen. Fordern Sie einen neuen Link an.',
    genericErrorInvite: 'Dieser Einladungslink ist nicht mehr gültig. Fordern Sie eine neue Einladung an.',
  },
};

export default function ResetPasswordForm({ darkMode, currentLang, token, mode }: {
  darkMode: boolean;
  currentLang: Locale;
  token: string;
  /** "recovery" = lien mot de passe oublié, "invite" = lien d'invitation Identity. */
  mode: 'recovery' | 'invite';
}) {
  const t = T[currentLang];
  const { confirmPasswordRecovery, acceptInvite } = useAuth();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass = `w-full px-4 py-3 rounded-xl border focus:border-[#232999] focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`;
  const labelClass = `block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setError(t.mismatchError);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (mode === 'invite') {
        await acceptInvite(token, password);
      } else {
        await confirmPasswordRecovery(token, password);
      }
      // Succès : AuthContext.user est maintenant peuplé, la page /espace
      // bascule d'elle-même vers la bibliothèque vidéo.
    } catch {
      setError(mode === 'invite' ? t.genericErrorInvite : t.genericErrorRecovery);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p className={`text-sm mb-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{mode === 'invite' ? t.introInvite : t.introRecovery}</p>
      <div className="mb-4">
        <label htmlFor="reset-password" className={labelClass}>{t.password}</label>
        <input id="reset-password" type="password" autoComplete="new-password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
      </div>
      <div className="mb-5">
        <label htmlFor="reset-password-confirm" className={labelClass}>{t.passwordConfirm}</label>
        <input id="reset-password-confirm" type="password" autoComplete="new-password" required minLength={6} value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} className={inputClass} />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <i className="ri-error-warning-line mr-1"></i>{error}
        </div>
      )}

      <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-[#232999] to-indigo-600 text-white px-6 py-3 rounded-full font-bold hover:shadow-xl transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
        {submitting ? t.submitting : t.submit}
      </button>
    </form>
  );
}
