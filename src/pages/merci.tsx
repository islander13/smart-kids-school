import { useEffect, useState } from 'react';
import { parseLocaleFromPath, localizedPath } from '../i18n/routing';

type Lang = 'FR' | 'EN' | 'DE';

const T: Record<Lang, {
  title: string;
  subtitle: string;
  emoji: string;
  steps: string;
  step1: string;
  step2: string;
  step3: string;
  ctaHome: string;
  ctaSupport: string;
  questions: string;
}> = {
  FR: {
    title: 'Merci pour votre inscription!',
    subtitle: 'Votre paiement a bien été reçu et confirmé.',
    emoji: '🎉',
    steps: 'Prochaines étapes',
    step1: "Vous recevez dans quelques minutes un email de confirmation de Stripe avec votre reçu de paiement.",
    step2: "Notre équipe vous contacte dans les 24h ouvrables pour planifier votre première séance et vous transmettre tous les détails pratiques.",
    step3: "Préparez votre matériel : un ordinateur (PC, Mac ou Chromebook), une connexion stable, et idéalement un casque audio.",
    ctaHome: "Retour à l'accueil",
    ctaSupport: 'Une question ? Contactez-nous',
    questions: 'Pour toute question urgente, écrivez-nous à contact@smartkids-school.ch ou via WhatsApp au +41 77 476 84 92.',
  },
  EN: {
    title: 'Thank you for your enrollment!',
    subtitle: 'Your payment has been received and confirmed.',
    emoji: '🎉',
    steps: 'Next steps',
    step1: "You'll receive a payment confirmation email from Stripe in the next few minutes with your receipt.",
    step2: 'Our team will contact you within 24 working hours to schedule your first session and share all practical details.',
    step3: 'Prepare your equipment: a computer (PC, Mac or Chromebook), a stable internet connection, and ideally a headset.',
    ctaHome: 'Back to home',
    ctaSupport: 'A question? Contact us',
    questions: 'For any urgent questions, write to us at contact@smartkids-school.ch or via WhatsApp at +41 77 476 84 92.',
  },
  DE: {
    title: 'Danke für Ihre Anmeldung!',
    subtitle: 'Ihre Zahlung wurde erfolgreich empfangen und bestätigt.',
    emoji: '🎉',
    steps: 'Nächste Schritte',
    step1: 'Sie erhalten in den nächsten Minuten eine Bestätigungs-E-Mail von Stripe mit Ihrem Zahlungsbeleg.',
    step2: 'Unser Team wird Sie innerhalb von 24 Werktagen kontaktieren, um Ihre erste Sitzung zu planen.',
    step3: 'Bereiten Sie Ihre Ausrüstung vor: einen Computer (PC, Mac oder Chromebook), eine stabile Internetverbindung und idealerweise ein Headset.',
    ctaHome: 'Zurück zur Startseite',
    ctaSupport: 'Eine Frage? Kontaktieren Sie uns',
    questions: 'Bei dringenden Fragen schreiben Sie uns an contact@smartkids-school.ch oder via WhatsApp +41 77 476 84 92.',
  },
};

export default function Merci() {
  const [currentLang] = useState<Lang>(() => parseLocaleFromPath(window.location.pathname).locale);
  const lp = (path: string) => localizedPath(path, currentLang);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try { return localStorage.getItem('sks_theme') === 'dark'; } catch { return false; }
  });

  useEffect(() => {
    // Tracking conversion (Plausible / GA)
    try {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');
      (window as any).gtag?.('event', 'purchase_complete', { session_id: sessionId || 'unknown' });
      (window as any).plausible?.('Purchase Complete');
      (window as any).fbq?.('track', 'Purchase', { currency: 'CHF' });
    } catch {}

    document.title = currentLang === 'FR' ? 'Merci !, Smart Kids School' : currentLang === 'EN' ? 'Thank you!, Smart Kids School' : 'Danke!, Smart Kids School';
  }, [currentLang]);

  // Re-sync depuis localStorage quand l'onglet redevient visible (fix mobile)
  useEffect(() => {
    const sync = () => {
      if (document.visibilityState === 'visible') {
        try {
          const savedTheme = localStorage.getItem('sks_theme');
          if (savedTheme === 'dark') setDarkMode(true);
          else if (savedTheme === 'light') setDarkMode(false);
        } catch {}
      }
    };
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('pageshow', sync);
    return () => {
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('pageshow', sync);
    };
  }, []);

  const t = T[currentLang];

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 font-['Inter',sans-serif] ${darkMode ? 'bg-gray-950 text-white' : 'bg-gradient-to-br from-indigo-50 via-blue-50 to-emerald-50 text-gray-900'}`}>
      <div className="max-w-2xl w-full">
        {/* Confetti / emoji célébration */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-4 animate-bounce">{t.emoji}</div>
          <h1 className={`text-4xl lg:text-5xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.title}</h1>
          <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.subtitle}</p>
        </div>

        {/* Card avec les prochaines étapes */}
        <div className={`rounded-3xl p-8 md:p-10 border-2 shadow-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className="text-3xl">📋</span>{t.steps}
          </h2>

          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
              <p className={`pt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.step1}</p>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-[#232999] rounded-full flex items-center justify-center text-white font-bold">2</div>
              <p className={`pt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.step2}</p>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
              <p className={`pt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.step3}</p>
            </div>
          </div>

          <div className={`mt-8 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.questions}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a href={lp('/')} className="bg-[#232999] hover:bg-[#1a1f7a] text-white px-8 py-4 rounded-full font-bold text-center hover:shadow-xl transform hover:scale-105 transition-all">
            ← {t.ctaHome}
          </a>
          <a href="https://wa.me/41774768492" target="_blank" rel="noopener noreferrer" className="bg-[#25D366] hover:bg-[#1ebe5d] text-white px-8 py-4 rounded-full font-bold text-center transition-all">
            💬 {t.ctaSupport}
          </a>
        </div>
      </div>
    </div>
  );
}
