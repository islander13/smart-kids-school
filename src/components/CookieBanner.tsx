import { useCallback, useEffect, useState } from 'react';

// Bannière de cookies partagée, utilisée par toutes les pages du site.
// Autonome : gère son propre état, ses traductions et le déclenchement
// des scripts (Plausible si stats acceptées, GA4 et Meta Pixel idem — voir
// applyConsent ci-dessous). Conforme nLPD/RGPD : le consentement est demandé
// sur chaque page d'entrée possible, et RIEN de tiers (GA4, Meta Pixel) ne se
// charge tant que l'utilisateur n'a pas explicitement accepté — avant le 18
// août ces deux scripts étaient posés sans condition dans index.html.

type Lang = 'FR' | 'EN' | 'DE';

type ConsentPrefs = { stats: boolean; marketing: boolean };

function loadPlausible() {
  if (typeof window === 'undefined' || (window as unknown as { plausible?: unknown }).plausible) return;
  const s = document.createElement('script');
  s.defer = true;
  s.setAttribute('data-domain', 'smartkids-school.ch');
  s.src = 'https://plausible.io/js/script.js';
  document.head.appendChild(s);
}

// GA4 : chargé et initialisé seulement ici, plus jamais depuis index.html.
function loadGA4() {
  const w = window as unknown as { __sksGaLoaded?: boolean; dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
  if (typeof window === 'undefined' || w.__sksGaLoaded) return;
  w.__sksGaLoaded = true;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-CJ55Z4B2Q2';
  document.head.appendChild(s);
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag(...args: unknown[]) { w.dataLayer!.push(args); };
  w.gtag('js', new Date());
  w.gtag('config', 'G-CJ55Z4B2Q2');
}

// Meta Pixel : même snippet officiel qu'avant, simplement déplacé ici et
// posé seulement après consentement "marketing" plutôt qu'au chargement.
function loadMetaPixel() {
  if (typeof window === 'undefined' || (window as unknown as { fbq?: unknown }).fbq) return;
  type FbqFn = { (...args: unknown[]): void; callMethod?: (...args: unknown[]) => void; queue: unknown[]; push: FbqFn; loaded: boolean; version: string };
  const f = window as unknown as { fbq?: FbqFn; _fbq?: FbqFn };
  const n: FbqFn = function (...args: unknown[]) {
    if (n.callMethod) n.callMethod(...args);
    else n.queue.push(args);
  } as FbqFn;
  n.queue = [];
  n.loaded = true;
  n.version = '2.0';
  n.push = n;
  f.fbq = n;
  if (!f._fbq) f._fbq = n;
  const t = document.createElement('script');
  t.async = true;
  t.src = 'https://connect.facebook.net/en_US/fbevents.js';
  const existing = document.getElementsByTagName('script')[0];
  existing.parentNode?.insertBefore(t, existing);
  n('init', '1573200597645423');
  n('track', 'PageView');
}

interface CookieBannerProps {
  currentLang: Lang;
  darkMode: boolean;
}

const TXT = {
  FR: {
    title: 'Nous respectons votre vie privée',
    desc: "Pour vous offrir la meilleure expérience, nous utilisons des cookies pour stocker et accéder aux informations de votre appareil. En acceptant, nous pourrons traiter des données comme votre comportement de navigation. Vous pouvez refuser ou retirer votre consentement à tout moment.",
    intro: 'Nous utilisons des cookies pour améliorer votre expérience.',
    more: "Plus d'infos",
    functional: 'Fonctionnels',
    stats: 'Statistiques',
    marketing: 'Marketing',
    accept: 'Accepter',
    refuse: 'Refuser',
    confirm: 'Confirmer',
    alwaysActive: 'Toujours actif',
    close: 'Fermer',
  },
  EN: {
    title: 'We respect your privacy',
    desc: 'To give you the best experience, we use cookies to store and access information on your device. By accepting, we may process data such as your browsing behaviour. You can refuse or withdraw your consent at any time.',
    intro: 'We use cookies to improve your experience.',
    more: 'Learn more',
    functional: 'Functional',
    stats: 'Statistics',
    marketing: 'Marketing',
    accept: 'Accept',
    refuse: 'Refuse',
    confirm: 'Confirm',
    alwaysActive: 'Always active',
    close: 'Close',
  },
  DE: {
    title: 'Wir respektieren Ihre Privatsphäre',
    desc: 'Um Ihnen das beste Erlebnis zu bieten, verwenden wir Cookies, um Informationen auf Ihrem Gerät zu speichern und abzurufen. Mit Ihrer Zustimmung können wir Daten wie Ihr Surfverhalten verarbeiten. Sie können Ihre Einwilligung jederzeit ablehnen oder widerrufen.',
    intro: 'Wir verwenden Cookies, um Ihre Erfahrung zu verbessern.',
    more: 'Mehr erfahren',
    functional: 'Funktional',
    stats: 'Statistiken',
    marketing: 'Marketing',
    accept: 'Akzeptieren',
    refuse: 'Ablehnen',
    confirm: 'Bestätigen',
    alwaysActive: 'Immer aktiv',
    close: 'Schliessen',
  },
};

export default function CookieBanner({ currentLang, darkMode }: CookieBannerProps) {
  const t = TXT[currentLang] || TXT.FR;

  const [consent, setConsent] = useState<'accepted' | 'refused' | 'pending'>(() => {
    try { return (localStorage.getItem('cookie_consent') as any) || 'pending'; }
    catch { return 'pending'; }
  });
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<ConsentPrefs>(() => {
    try {
      const saved = localStorage.getItem('cookie_prefs');
      return saved ? JSON.parse(saved) : { stats: true, marketing: false };
    } catch { return { stats: true, marketing: false }; }
  });

  // GA4 = mesure d'audience → catégorie "stats", comme Plausible. Meta Pixel
  // = publicité/retargeting → catégorie "marketing". Rien de tiers ne se
  // charge ici tant que la catégorie correspondante n'est pas cochée.
  const applyConsent = useCallback((chosen: ConsentPrefs) => {
    if (chosen.stats) { loadPlausible(); loadGA4(); }
    if (chosen.marketing) loadMetaPixel();
  }, []);

  // Visite de retour : le consentement est déjà enregistré (la bannière ne
  // se réaffiche pas, voir le "return null" plus bas), donc c'est ici et
  // seulement ici que les scripts déjà autorisés doivent être rechargés —
  // sans ce useEffect, seule la toute première visite (clic sur "Accepter")
  // les chargeait, jamais les suivantes.
  useEffect(() => {
    if (consent === 'accepted') applyConsent(prefs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accept = (p?: ConsentPrefs) => {
    const chosen = p || prefs;
    try {
      localStorage.setItem('cookie_consent', 'accepted');
      localStorage.setItem('cookie_prefs', JSON.stringify(chosen));
    } catch {}
    setPrefs(chosen);
    setConsent('accepted');
    applyConsent(chosen);
  };

  const refuse = () => {
    try {
      localStorage.setItem('cookie_consent', 'refused');
      localStorage.setItem('cookie_prefs', JSON.stringify({ stats: false, marketing: false }));
    } catch {}
    setConsent('refused');
  };

  if (consent !== 'pending') return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:right-auto md:max-w-md z-50">
      <div className={`rounded-2xl shadow-2xl border p-4 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`} style={{ animation: 'cookie-slide-in 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <style>{`@keyframes cookie-slide-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>

        {!showDetails ? (
          <div className="flex flex-col gap-3">
            <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              🍪 {t.intro}{' '}
              <button onClick={() => setShowDetails(true)} className={`underline font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-[#232999] hover:text-[#1a1f7a]'}`}>
                {t.more}
              </button>
            </p>
            <div className="flex gap-2 items-center">
              <button onClick={() => accept({ stats: true, marketing: false })} className="flex-1 bg-[#232999] hover:bg-[#1a1f7a] text-white px-4 py-2 rounded-full text-sm font-semibold transition-all hover:shadow-lg whitespace-nowrap">
                {t.accept}
              </button>
              <button onClick={refuse} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                {t.refuse}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.title}</h3>
              <button onClick={() => setShowDetails(false)} className={`p-1 rounded-full ${darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`} aria-label={t.close}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p className={`text-xs mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.desc}</p>
            <div className="space-y-2 mb-3">
              <div className={`flex items-center justify-between gap-3 p-2.5 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.functional}</p>
                <span className="text-xs font-semibold text-emerald-600 whitespace-nowrap flex-shrink-0">{t.alwaysActive}</span>
              </div>
              {([
                { label: t.stats, key: 'stats' as const },
                { label: t.marketing, key: 'marketing' as const },
              ]).map((item) => (
                <div key={item.key} className={`flex items-center justify-between gap-3 p-2.5 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.label}</p>
                  <button type="button" onClick={() => setPrefs(p => ({ ...p, [item.key]: !p[item.key] }))} className={`relative flex-shrink-0 w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#232999] ${prefs[item.key] ? 'bg-[#232999]' : darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} aria-checked={prefs[item.key]} aria-label={item.label} role="switch">
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${prefs[item.key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => accept(prefs)} className="flex-1 bg-[#232999] hover:bg-[#1a1f7a] text-white px-4 py-2 rounded-full text-sm font-semibold transition-all">
                {t.confirm}
              </button>
              <button onClick={refuse} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                {t.refuse}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
