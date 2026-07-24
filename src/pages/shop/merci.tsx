import { useState, useEffect, useRef } from 'react';
import { parseLocaleFromPath, localizedPath } from '../../i18n/routing';

// ─────────────────────────────────────────────────────────────────────────
// Page de succès après achat boutique (return_url de create-shop-checkout-
// session.js : /shop/merci?session_id=...). PAS ENCORE BRANCHÉE au routeur.
//
// Interroge shop-order-lookup.js jusqu'à obtenir le lien de téléchargement
// (le webhook Stripe peut arriver quelques secondes après la redirection
// du client — d'où les tentatives répétées plutôt qu'un simple appel unique).
// ─────────────────────────────────────────────────────────────────────────

type Lang = 'FR' | 'EN' | 'DE';
type LookupStatus = 'checking' | 'confirmed' | 'timeout' | 'error';

const T: Record<Lang, {
  title: string;
  subtitle: string;
  checking: string;
  timeoutTitle: string;
  timeoutDesc: string;
  download: string;
  ctaHome: string;
  ctaSupport: string;
}> = {
  FR: {
    title: 'Merci pour votre achat !',
    subtitle: 'Votre paiement a bien été reçu et confirmé.',
    checking: 'Préparation de votre téléchargement…',
    timeoutTitle: 'Ça prend plus de temps que prévu',
    timeoutDesc: "Votre paiement est confirmé, mais la préparation du lien prend plus longtemps que d'habitude. Rechargez cette page dans une minute, ou écrivez-nous avec votre email si le problème persiste.",
    download: '⬇ Télécharger mon ebook',
    ctaHome: "Retour à l'accueil",
    ctaSupport: 'Une question ? Contactez-nous',
  },
  EN: {
    title: 'Thank you for your purchase!',
    subtitle: 'Your payment has been received and confirmed.',
    checking: 'Preparing your download…',
    timeoutTitle: 'This is taking longer than expected',
    timeoutDesc: 'Your payment is confirmed, but preparing the link is taking longer than usual. Reload this page in a minute, or write to us with your email if the issue persists.',
    download: '⬇ Download my ebook',
    ctaHome: 'Back to home',
    ctaSupport: 'A question? Contact us',
  },
  DE: {
    title: 'Danke für Ihren Kauf!',
    subtitle: 'Ihre Zahlung wurde erfolgreich empfangen und bestätigt.',
    checking: 'Ihr Download wird vorbereitet…',
    timeoutTitle: 'Das dauert länger als erwartet',
    timeoutDesc: 'Ihre Zahlung ist bestätigt, aber die Vorbereitung des Links dauert länger als gewöhnlich. Laden Sie diese Seite in einer Minute neu, oder schreiben Sie uns mit Ihrer E-Mail, falls das Problem bestehen bleibt.',
    download: '⬇ Mein Ebook herunterladen',
    ctaHome: 'Zurück zur Startseite',
    ctaSupport: 'Eine Frage? Kontaktieren Sie uns',
  },
};

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 15; // ~30s avant d'afficher le message "ça prend du temps"

export default function ShopMerci() {
  const [currentLang] = useState<Lang>(() => parseLocaleFromPath(window.location.pathname).locale);
  const lp = (path: string) => localizedPath(path, currentLang);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try { return localStorage.getItem('sks_theme') === 'dark'; } catch { return false; }
  });
  const [status, setStatus] = useState<LookupStatus>('checking');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    document.title = currentLang === 'FR' ? 'Merci !, Smart Kids School' : currentLang === 'EN' ? 'Thank you!, Smart Kids School' : 'Danke!, Smart Kids School';
  }, [currentLang]);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    if (!sessionId) {
      setStatus('error');
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const res = await fetch(`/.netlify/functions/shop-order-lookup?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();
        if (cancelled) return;

        if (data.status === 'confirmed' && data.downloadUrl) {
          setDownloadUrl(data.downloadUrl);
          setStatus('confirmed');
          try {
            (window as any).gtag?.('event', 'shop_purchase_complete', { session_id: sessionId });
            (window as any).plausible?.('Shop Purchase Complete');
          } catch {}
          return;
        }
      } catch {
        // on réessaie silencieusement, voir MAX_ATTEMPTS ci-dessous
      }

      attemptsRef.current += 1;
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        if (!cancelled) setStatus('timeout');
        return;
      }
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  const t = T[currentLang];

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 font-['Inter',sans-serif] ${darkMode ? 'bg-gray-950 text-white' : 'bg-gradient-to-br from-indigo-50 via-blue-50 to-emerald-50 text-gray-900'}`}>
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="text-8xl mb-4 animate-bounce">🎉</div>
          <h1 className={`text-4xl lg:text-5xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.title}</h1>
          <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.subtitle}</p>
        </div>

        <div className={`rounded-3xl p-8 md:p-10 border-2 shadow-xl text-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {status === 'checking' && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-10 h-10 border-4 border-[#232999] border-t-transparent rounded-full animate-spin"></div>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{t.checking}</p>
            </div>
          )}

          {status === 'confirmed' && downloadUrl && (
            <a href={downloadUrl} className="inline-block bg-[#232999] hover:bg-[#1a1f7a] text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transform hover:scale-105 transition-all">
              {t.download}
            </a>
          )}

          {(status === 'timeout' || status === 'error') && (
            <div>
              <p className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.timeoutTitle}</p>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{t.timeoutDesc}</p>
            </div>
          )}
        </div>

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
