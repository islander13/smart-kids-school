import type { Locale } from '../../i18n/routing';
import { localizedPath } from '../../i18n/routing';
import MyCertificates from './MyCertificates';

// ─────────────────────────────────────────────────────────────────────────
// Affiché à la place du tableau de bord quand user.app_metadata.subscriptionActive
// vaut explicitement false — coupé par stripe-webhook.js à la résiliation
// d'un abonnement récurrent (voir customer.subscription.deleted). Le compte
// et toute la progression restent intacts en base ; ils réapparaissent
// automatiquement dès qu'un nouveau paiement est confirmé (le webhook remet
// subscriptionActive à true à ce moment-là) — rien à faire ici pour la reprise.
//
// Les certificats restent affichés malgré tout : contrairement aux vidéos
// (contenu du service en cours), un certificat est un acquis définitif —
// le couper avec le reste de "Mon espace" aurait privé une famille qui a
// résilié (déménagement, fin de cursus...) de la seule preuve qu'elle a
// pour un cours déjà terminé. list-my-certificates.js ne vérifie d'ailleurs
// pas subscriptionActive, seulement que le JWT est valide.
// ─────────────────────────────────────────────────────────────────────────

const T: Record<Locale, { title: string; desc: string; cta: string; logout: string }> = {
  FR: {
    title: 'Abonnement inactif',
    desc: "Votre abonnement n'est plus actif, donc l'accès à Mon espace est en pause. Votre progression et vos badges sont conservés : ils reviendront dès la reprise d'un abonnement.",
    cta: 'Reprendre un abonnement',
    logout: 'Se déconnecter',
  },
  EN: {
    title: 'Subscription inactive',
    desc: 'Your subscription is no longer active, so access to My space is on hold. Your progress and badges are kept safe and will come back as soon as you resubscribe.',
    cta: 'Resubscribe',
    logout: 'Log out',
  },
  DE: {
    title: 'Abonnement inaktiv',
    desc: 'Ihr Abonnement ist nicht mehr aktiv, daher ist der Zugang zu Mein Bereich pausiert. Ihr Fortschritt und Ihre Abzeichen bleiben erhalten und kehren zurück, sobald Sie erneut abonnieren.',
    cta: 'Abonnement erneuern',
    logout: 'Abmelden',
  },
};

export default function SubscriptionEndedNotice({ darkMode, currentLang, onLogout }: {
  darkMode: boolean;
  currentLang: Locale;
  onLogout: () => void;
}) {
  const t = T[currentLang];

  return (
    <div className="max-w-md mx-auto text-center py-8">
      <div className={`w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-amber-900/30' : 'bg-amber-100'}`}>
        <i className="ri-pause-circle-line text-3xl text-amber-500"></i>
      </div>
      <h1 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.title}</h1>
      <p className={`text-sm leading-relaxed mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.desc}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
        <a href={localizedPath('/tarifs', currentLang)} className="bg-[#232999] hover:bg-[#1a1f7a] text-white px-6 py-3 rounded-full text-sm font-semibold transition-all whitespace-nowrap">
          {t.cta}
        </a>
        <button type="button" onClick={onLogout} className={`px-6 py-3 rounded-full text-sm font-semibold cursor-pointer transition-colors ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
          {t.logout}
        </button>
      </div>
      <div className="text-left">
        <MyCertificates darkMode={darkMode} currentLang={currentLang} />
      </div>
    </div>
  );
}
