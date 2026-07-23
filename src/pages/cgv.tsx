import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import CookieBanner from '../components/CookieBanner';
import { parseLocaleFromPath, localizedPath, setHreflangTags } from '../i18n/routing';

type Lang = 'FR' | 'EN' | 'DE';

// ── Inline SVG icons ──────────────────────────────────────────────────────
const icons = {
  building:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  book:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  list:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  payment:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  video:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  calendar:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  back:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14l-5-5 5-5"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>,
  copyright:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M14.83 14.83A4 4 0 1 1 14.83 9.17"/></svg>,
  scales:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 9l4-4 4 4M17 15l4 4-4 4"/><line x1="3" y1="21" x2="21" y2="21"/></svg>,
  gov:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>,
  parent:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  settings:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M20 12h2M2 12h2M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 20v2M12 2v2"/></svg>,
  shield:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  check:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  card:       <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  phone:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  headphones: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,
  sun:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon:       <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  chevron:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  alert:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  shieldCheck:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
};

function Section({ darkMode, iconEl, num, title, children }: {
  darkMode: boolean; iconEl: React.ReactNode; num: string; title: string; children: React.ReactNode;
}) {
  return (
    <section className={`rounded-2xl border p-8 mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h2 className={`text-xl font-bold mb-5 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        <span className="flex-shrink-0 w-8 h-8 bg-[#232999] text-white rounded-full flex items-center justify-center text-sm font-bold">{num}</span>
        <span className="text-[#232999]">{iconEl}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function CGV() {
  const [lang, setLang] = useState<Lang>(() => parseLocaleFromPath(window.location.pathname).locale);
  const navigate = useNavigate();
  const lp = (path: string) => localizedPath(path, lang);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try { return localStorage.getItem('sks_theme') === 'dark'; } catch { return false; }
  });
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Canonical + meta robots
    const setMeta = (name: string, content: string, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.content = content;
    };
    const titles: Record<Lang, string> = {
      FR: 'Conditions Générales de Vente | Smart Kids School',
      EN: 'Terms and Conditions of Sale | Smart Kids School',
      DE: 'Allgemeine Geschäftsbedingungen | Smart Kids School',
    };
    const descs: Record<Lang, string> = {
      FR: 'Conditions générales de vente de Smart Kids School, cours de programmation Scratch en ligne pour enfants en Suisse. Tarifs, annulation, remboursement, droit applicable.',
      EN: "Smart Kids School's terms and conditions of sale, online Scratch programming classes for children in Switzerland. Pricing, cancellation, refunds, applicable law.",
      DE: 'Allgemeine Geschäftsbedingungen von Smart Kids School, Online-Scratch-Programmierkurse für Kinder in der Schweiz. Preise, Kündigung, Rückerstattung, anwendbares Recht.',
    };
    document.title = titles[lang];
    setMeta('description', descs[lang]);
    setMeta('robots', 'index, follow');
    setMeta('og:title', titles[lang], 'property');
    setMeta('og:description', descs[lang], 'property');
    setMeta('og:url', `https://smartkids-school.ch${localizedPath('/cgv', lang)}`, 'property');
    setHreflangTags('/cgv', lang);
  }, [lang]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    try {
      localStorage.setItem('sks_theme', darkMode ? 'dark' : 'light');
      localStorage.setItem('sks_lang', lang);
    } catch {}
  }, [darkMode, lang]);

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

  const tx = (fr: string, en: string, de: string) => lang === 'FR' ? fr : lang === 'EN' ? en : de;

  return (
    <div className={`min-h-screen font-['Inter',sans-serif] transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm shadow-sm transition-colors duration-300 ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center gap-3">
              <a href={lp('/')}><img src="/Logo_official_dark.png" alt="Smart Kids School" width="192" height="64" className="h-16 w-auto" /></a>
              <img src="/flag-ch.png" alt="Drapeau de la Suisse" width="24" height="24" className="h-6 w-auto flex-shrink-0 shadow-sm rounded-sm" />
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8 ml-8">
              <a href={lp('/')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{tx('Accueil', 'Home', 'Startseite')}</a>
              <a href={lp('/tarifs')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{tx('Tarifs', 'Pricing', 'Preise')}</a>
              <a href={lp('/stages')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{tx('Stages', 'Camps', 'Camps')}</a>
              <a href={lp('/premium')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>Premium</a>
              <a href={lp('/faq')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>FAQ</a>
              <a href={lp('/blog')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>Blog</a>
            </div>

            {/* Desktop : dark + lang */}
            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => setDarkMode(!darkMode)} aria-label="Toggle theme"
                className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-300 cursor-pointer ${darkMode ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-100 border-gray-200 text-gray-700 hover:border-indigo-400'}`}>
                {darkMode ? icons.sun : icons.moon}
              </button>
              <div className="relative">
                <button onClick={() => setShowLangDropdown(!showLangDropdown)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors cursor-pointer ${darkMode ? 'border-gray-600 hover:border-indigo-400 text-gray-300' : 'border-gray-200 hover:border-indigo-400 text-gray-700'}`}>
                  <span className="text-sm font-medium">{lang}</span>
                  <span className={`transition-transform inline-block ${showLangDropdown ? 'rotate-180' : ''}`}>{icons.chevron}</span>
                </button>
                {showLangDropdown && (
                  <div className={`absolute top-full right-0 mt-2 rounded-lg shadow-lg border overflow-hidden z-50 min-w-[80px] ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    {(['FR', 'EN', 'DE'] as Lang[]).map(l => (
                      <button key={l} onClick={() => { setLang(l); setShowLangDropdown(false); navigate(localizedPath('/cgv', l)); }}
                        className={`w-full px-4 py-2.5 text-sm text-left transition-colors cursor-pointer ${lang === l ? 'bg-[#232999] text-white font-semibold' : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-indigo-50'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile burger + dark toggle */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={() => setDarkMode(!darkMode)} aria-label="Toggle theme"
                className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 cursor-pointer ${darkMode ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-100 border-gray-200 text-gray-700'}`}>
                {darkMode ? icons.sun : icons.moon}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu"
                className={`p-2 rounded-lg transition-colors cursor-pointer ${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {mobileMenuOpen
                    ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                    : <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className={`md:hidden border-t ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="px-4 py-4 space-y-3">
              <a href={lp('/')} onClick={() => setMobileMenuOpen(false)} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{tx('Accueil', 'Home', 'Startseite')}</a>
              <a href={lp('/tarifs')} onClick={() => setMobileMenuOpen(false)} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{tx('Tarifs', 'Pricing', 'Preise')}</a>
              <a href={lp('/stages')} onClick={() => setMobileMenuOpen(false)} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{tx('Stages', 'Camps', 'Camps')}</a>
              <a href={lp('/premium')} onClick={() => setMobileMenuOpen(false)} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>Premium</a>
              <a href={lp('/faq')} onClick={() => setMobileMenuOpen(false)} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>FAQ</a>
              <a href={lp('/blog')} onClick={() => setMobileMenuOpen(false)} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>Blog</a>
              <div className="flex gap-2 py-2">
                {(['FR', 'EN', 'DE'] as Lang[]).map(l => (
                  <button key={l} onClick={() => { setLang(l); setMobileMenuOpen(false); navigate(localizedPath('/cgv', l)); }} className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${lang === l ? 'bg-[#232999] text-white' : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-4xl mx-auto px-4 pt-32 pb-16">
        <a href={lp('/')} className="text-[#232999] hover:underline text-sm font-medium mb-6 inline-block">
          {tx('← Retour au site', '← Back to site', '← Zurück zur Website')}
        </a>

        <div className="mb-10">
          <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {tx('Conditions Générales de Vente', 'Terms & Conditions of Sale', 'Allgemeine Geschäftsbedingungen (AGB)')}
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {tx('En vigueur à compter du 1er janvier 2025, Dernière mise à jour : mars 2026', 'Effective from January 1, 2025, Last updated: March 2026', 'Gültig ab 1. Januar 2025, Zuletzt aktualisiert: März 2026')}
          </p>
        </div>

        {/* Préambule */}
        <div className={`rounded-2xl border p-6 mb-6 ${darkMode ? 'bg-indigo-900/30 border-indigo-700' : 'bg-indigo-50 border-indigo-200'}`}>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-indigo-200' : 'text-indigo-900'}`}>
            {tx(
              "Les présentes Conditions Générales de Vente (CGV) régissent l'ensemble des ventes de services de cours de programmation en ligne conclues entre Smart Kids School (ci-après « SKS ») et toute personne souhaitant procéder à l'achat de cours. Toute commande implique l'acceptation pleine et entière des présentes CGV.",
              "These Terms & Conditions of Sale govern all sales of online programming course services concluded between Smart Kids School ('SKS') and any person wishing to purchase courses. Any order implies full acceptance of these Terms.",
              "Diese AGB regeln alle Verkäufe von Online-Programmierkursen zwischen Smart Kids School ('SKS') und jeder Person, die Kurse erwerben möchte. Jede Bestellung beinhaltet die vollständige Annahme dieser AGB."
            )}
          </p>
        </div>

        {/* 1 */}
        <Section darkMode={darkMode} iconEl={icons.building} num="1" title={tx("Informations sur le Prestataire", "Provider Information", "Informationen zum Anbieter")}>
          <div className={`grid md:grid-cols-2 gap-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {[
              { label: tx('Raison sociale', 'Company name', 'Firmenname'), value: 'Smart Kids School (SKS)' },
              { label: tx('Forme juridique', 'Legal form', 'Rechtsform'), value: tx('Raison individuelle', 'Sole proprietorship', 'Einzelunternehmen') },
              { label: tx('Siège', 'Address', 'Sitz'), value: "Avenue d'Echallens 60, 1004 Lausanne, Suisse" },
              { label: 'Email', value: 'contact@smartkids-school.ch' },
              { label: tx('Téléphone', 'Phone', 'Telefon'), value: '(+41) 077 476 84 92' },
              { label: 'Site web', value: 'www.smartkids-school.ch' },
            ].map((item, i) => (
              <div key={i}>
                <p className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{item.label}</p>
                <p>{item.value}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 2 */}
        <Section darkMode={darkMode} iconEl={icons.book} num="2" title={tx("Services Proposés", "Services Offered", "Angebotene Dienste")}>
          <div className={`space-y-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>
              {tx(
                "Smart Kids School propose des cours de programmation éducative en ligne pour enfants de 7 à 15 ans, utilisant Scratch (MIT), Python, ainsi que des modules d'IA et de robotique. Les cours sont dispensés en visioconférence par des formateurs qualifiés (ingénieurs EPFL & ETHZ).",
                "Smart Kids School offers online educational programming courses for children aged 7–15, using Scratch (MIT), Python, and modules in AI and robotics. Courses are delivered via video conference by qualified instructors (EPFL & ETHZ engineers).",
                "Smart Kids School bietet Online-Programmierkurse für Kinder von 7–15 Jahren an, mit Scratch (MIT), Python und Modulen zu KI und Robotik. Kurse werden per Videokonferenz von qualifizierten Lehrern (EPFL- & ETHZ-Ingenieuren) gehalten."
              )}
            </p>

            <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
              {tx("Les formules disponibles :", "Available packages:", "Verfügbare Pakete:")}
            </p>

            <ul className="space-y-2 ml-2">
              <li className="flex gap-2">
                <span className="text-[#232999] font-bold flex-shrink-0">•</span>
                <span>
                  <strong>{tx("Solo", "Solo", "Solo")}</strong> {tx("(1 enfant)", "(1 child)", "(1 Kind)")}, {tx("Cours individuel personnalisé. 4 séances de 1h par mois. Engagement minimum de 3 mois, avec un tarif mensuel dégressif sur 6 ou 12 mois.", "One-on-one personalised classes. 4 sessions of 1h per month. Minimum 3-month commitment, with a lower monthly rate on 6 or 12-month plans.", "Personalisierter Einzelunterricht. 4 Sitzungen à 1h pro Monat. Mindestbindung von 3 Monaten, mit vergünstigtem Monatstarif bei 6 oder 12 Monaten.")}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#232999] font-bold flex-shrink-0">•</span>
                <span>
                  <strong>{tx("Duo", "Duo", "Duo")}</strong> {tx("(2 enfants)", "(2 children)", "(2 Kinder)")}, {tx("Cours partagé entre 2 enfants (frère, sœur ou ami). Le tarif total inclut les 2 enfants. 4 séances de 1h par mois. Engagement minimum de 3 mois, avec un tarif mensuel dégressif sur 6 ou 12 mois.", "Shared course between 2 children (sibling or friend). Total price covers both children. 4 sessions of 1h per month. Minimum 3-month commitment, with a lower monthly rate on 6 or 12-month plans.", "Geteilter Kurs zwischen 2 Kindern (Geschwister oder Freund). Gesamtpreis deckt beide Kinder ab. 4 Sitzungen à 1h pro Monat. Mindestbindung von 3 Monaten, mit vergünstigtem Monatstarif bei 6 oder 12 Monaten.")}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold flex-shrink-0">•</span>
                <span>
                  <strong>{tx("Premium", "Premium", "Premium")}</strong>, {tx("Mentorat individuel avec le fondateur : 2 séances par semaine, projet publié en 12 mois, préparation aux concours, bilan trimestriel avec les parents, accès direct au fondateur, 2 stages vacances offerts par an. Disponible sans engagement ou en paiement total 12 mois (-10%).", "One-to-one mentoring with the founder: 2 sessions per week, project published within 12 months, competition preparation, quarterly review with parents, direct access to the founder, 2 vacation camps offered per year. Available without commitment or as 12-month full payment (-10%).", "Einzelmentoring mit dem Gründer: 2 Sitzungen pro Woche, in 12 Monaten veröffentlichtes Projekt, Wettbewerbsvorbereitung, vierteljährliches Elterngespräch, direkter Zugang zum Gründer, 2 Ferien-Camps pro Jahr inklusive. Ohne Bindung oder als 12-Monats-Vollzahlung (-10%) verfügbar.")}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600 font-bold flex-shrink-0">•</span>
                <span>
                  <strong>{tx("Stages vacances", "Vacation camps", "Ferien-Camps")}</strong>, {tx("Stages intensifs pendant les vacances scolaires (Pâques, été, automne, février). Tarif par enfant et par stage, avec rabais 10% sur le 2ᵉ enfant de la même fratrie.", "Intensive camps during school holidays (Easter, summer, autumn, February). Price per child per camp, with 10% discount on 2nd child from same family.", "Intensive Camps in den Schulferien (Ostern, Sommer, Herbst, Februar). Preis pro Kind pro Camp, mit 10% Rabatt auf das 2. Kind aus derselben Familie.")}
                </span>
              </li>
            </ul>

            <div className={`rounded-xl border p-4 ${darkMode ? 'bg-indigo-950/30 border-indigo-800' : 'bg-indigo-50 border-indigo-200'}`}>
              <p className="text-sm">
                <strong>
                  {tx("📋 Tarifs détaillés à jour :", "📋 Up-to-date detailed pricing:", "📋 Aktuelle detaillierte Preise:")}
                </strong>{' '}
                <a href={lp('/tarifs')} className="text-[#232999] font-semibold underline hover:no-underline">
                  smartkids-school.ch/tarifs
                </a>
                {' '}
                {tx("(la grille tarifaire complète, toujours actualisée, est disponible sur cette page).", "(the complete pricing grid, always updated, is available on this page).", "(die komplette Preisliste ist auf dieser Seite immer aktualisiert verfügbar).")}
              </p>
            </div>

            <p className="text-xs italic">
              {tx(
                "Tous les prix sont en CHF, toutes taxes comprises. Smart Kids School est non assujettie à la TVA suisse (CA < 100 000 CHF).",
                "All prices in CHF, taxes included. Smart Kids School is not subject to Swiss VAT (turnover < CHF 100,000).",
                "Alle Preise in CHF, inkl. Steuern. Smart Kids School unterliegt nicht der Schweizer MwSt. (Umsatz < CHF 100.000)."
              )}
            </p>
          </div>
        </Section>

        {/* 3 */}
        <Section darkMode={darkMode} iconEl={icons.list} num="3" title={tx("Commande & Processus d'Inscription", "Order & Enrollment Process", "Bestellung & Anmeldeprozess")}>
          <div className={`space-y-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>
              {tx(
                "La commande est formalisée par le remplissage du formulaire d'inscription sur le site, suivi du paiement intégral. La vente n'est définitive qu'après confirmation du paiement par Stripe.",
                "The order is formalized by filling in the enrollment form on the site, followed by full payment. The sale is only final after Stripe payment confirmation.",
                "Die Bestellung wird durch das Ausfüllen des Anmeldeformulars und die vollständige Zahlung formalisiert. Der Verkauf ist erst nach Stripe-Zahlungsbestätigung endgültig."
              )}
            </p>
            {[
              tx("Remplissage du formulaire d'inscription (coordonnées du parent et de l'enfant, niveau souhaité)", "Fill in the enrollment form (parent and child details, desired level)", "Anmeldeformular ausfüllen (Eltern- und Kinderdaten, gewünschtes Niveau)"),
              tx("Choix du mode de paiement et validation", "Choose payment method and confirm", "Zahlungsmethode wählen und bestätigen"),
              tx("Redirection vers la page de paiement sécurisé Stripe", "Redirect to Stripe secure payment page", "Weiterleitung zur sicheren Stripe-Zahlungsseite"),
              tx("Confirmation de paiement et email de bienvenue envoyé dans les 48h ouvrables", "Payment confirmation and welcome email within 48 business hours", "Zahlungsbestätigung und Willkommens-E-Mail innerhalb von 48 Geschäftsstunden"),
              tx("Planification des séances en accord avec le parent", "Session scheduling agreed with the parent", "Terminplanung in Absprache mit dem Elternteil"),
            ].map((step, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <span className="flex-shrink-0 w-6 h-6 bg-[#232999] text-white rounded-full flex items-center justify-center text-xs font-bold">{i+1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 4 */}
        <Section darkMode={darkMode} iconEl={icons.payment} num="4" title={tx("Modalités de Paiement", "Payment Terms", "Zahlungsbedingungen")}>
          <div className={`space-y-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>
              {tx(
                "Le paiement est exigible au moment de la commande. Aucun cours n'est planifié avant réception du paiement initial. Smart Kids School propose plusieurs modalités selon la formule choisie :",
                "Payment is due at the time of ordering. No sessions are scheduled before receipt of initial payment. Smart Kids School offers several payment terms depending on the package chosen:",
                "Die Zahlung ist bei der Bestellung fällig. Es werden keine Sitzungen geplant, bevor die Erstzahlung eingegangen ist. Smart Kids School bietet je nach gewähltem Paket mehrere Modalitäten:"
              )}
            </p>

            {/* Modalités d'abonnement */}
            <div className={`rounded-xl border p-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {tx("4.1 Abonnement mensuel (Solo, Duo, Premium)", "4.1 Monthly subscription (Solo, Duo, Premium)", "4.1 Monatliches Abonnement (Solo, Duo, Premium)")}
              </h4>
              <ul className="space-y-2 text-sm ml-2">
                <li className="flex gap-2">
                  <span className="text-[#232999] flex-shrink-0">•</span>
                  <span>
                    <strong>{tx("Sans engagement", "No commitment", "Ohne Bindung")} :</strong>{' '}
                    {tx("paiement mensuel automatique. Annulable à tout moment, effective à la fin du mois en cours payé.", "automatic monthly payment. Cancellable anytime, effective at the end of the current paid month.", "automatische monatliche Zahlung. Jederzeit kündbar, gültig zum Ende des laufenden bezahlten Monats.")}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#232999] flex-shrink-0">•</span>
                  <span>
                    <strong>{tx("Engagement 6 mois", "6-month commitment", "6-Monats-Bindung")} :</strong>{' '}
                    {tx("paiement mensuel avec un tarif réduit. Le Client s'engage pour 6 mois consécutifs. L'abonnement se renouvelle ensuite mensuellement, annulable à tout moment.", "monthly payment at a reduced rate. The Client commits for 6 consecutive months. The subscription then renews monthly, cancellable anytime.", "monatliche Zahlung zu reduziertem Tarif. Der Kunde verpflichtet sich für 6 aufeinanderfolgende Monate. Das Abonnement verlängert sich danach monatlich und ist jederzeit kündbar.")}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#232999] flex-shrink-0">•</span>
                  <span>
                    <strong>{tx("Engagement 12 mois", "12-month commitment", "12-Monats-Bindung")} :</strong>{' '}
                    {tx("paiement mensuel avec un tarif encore plus avantageux. Le Client s'engage pour 12 mois consécutifs. L'abonnement se renouvelle ensuite mensuellement.", "monthly payment at an even more favorable rate. The Client commits for 12 consecutive months. The subscription then renews monthly.", "monatliche Zahlung zu noch günstigerem Tarif. Der Kunde verpflichtet sich für 12 aufeinanderfolgende Monate. Das Abonnement verlängert sich danach monatlich.")}
                  </span>
                </li>
              </ul>
            </div>

            {/* Paiement total */}
            <div className={`rounded-xl border p-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {tx("4.2 Paiement total avec rabais (option)", "4.2 Total payment with discount (option)", "4.2 Gesamtzahlung mit Rabatt (Option)")}
              </h4>
              <p className="text-sm">
                {tx(
                  "Le Client peut choisir de régler la totalité de la période d'engagement en un seul versement, et bénéficier d'un rabais immédiat :",
                  "The Client may choose to pay the entire commitment period in a single payment, and benefit from an immediate discount:",
                  "Der Kunde kann sich entscheiden, den gesamten Bindungszeitraum in einer einzigen Zahlung zu begleichen und einen sofortigen Rabatt zu erhalten:"
                )}
              </p>
              <ul className="space-y-1 text-sm ml-2 mt-2">
                <li className="flex gap-2">
                  <span className="text-emerald-600 flex-shrink-0">✓</span>
                  <span>{tx("6 mois en paiement total : rabais d'environ 5%", "6 months full payment: approx. 5% discount", "6 Monate Vollzahlung: ca. 5% Rabatt")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-600 flex-shrink-0">✓</span>
                  <span>{tx("12 mois en paiement total : rabais d'environ 10%", "12 months full payment: approx. 10% discount", "12 Monate Vollzahlung: ca. 10% Rabatt")}</span>
                </li>
              </ul>
              <p className={`text-xs italic mt-2 ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                {tx(
                  "⚠️ Le paiement total n'est pas remboursable une fois la 1ère séance suivie (hors garantie 1ère séance, voir Section 6).",
                  "⚠️ Total payment is not refundable after the 1st session (except 1st-session guarantee, see Section 6).",
                  "⚠️ Vollzahlung ist nach der 1. Sitzung nicht erstattungsfähig (außer 1.-Sitzung-Garantie, siehe Abschnitt 6)."
                )}
              </p>
            </div>

            {/* Stages */}
            <div className={`rounded-xl border p-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {tx("4.3 Stages vacances", "4.3 Vacation camps", "4.3 Ferien-Camps")}
              </h4>
              <p className="text-sm">
                {tx(
                  "Le tarif des stages est à payer en une fois au moment de l'inscription. Les inscriptions sont validées sous 24h ouvrables après réception du paiement.",
                  "Camp fees are payable in full at registration. Registrations are confirmed within 24 working hours of payment receipt.",
                  "Camp-Gebühren sind bei der Anmeldung vollständig zahlbar. Anmeldungen werden innerhalb von 24 Werkstunden nach Zahlungseingang bestätigt."
                )}
              </p>
            </div>

            {/* Moyens de paiement */}
            <p className={`font-semibold mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
              {tx("4.4 Moyens de paiement acceptés :", "4.4 Accepted payment methods:", "4.4 Akzeptierte Zahlungsmittel:")}
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { iconEl: icons.card, title: tx('Carte bancaire', 'Credit/Debit card', 'Bankkarte'), desc: 'Visa, Mastercard, American Express, via Stripe (PCI-DSS L1)' },
                { iconEl: icons.phone, title: 'Apple Pay / Google Pay / TWINT', desc: tx('Via Stripe, disponible selon l\'appareil et le pays', 'Via Stripe, depending on device and country', 'Via Stripe, je nach Gerät und Land') },
              ].map((pm, i) => (
                <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <span className="text-[#232999] flex-shrink-0">{pm.iconEl}</span>
                  <div><p className="font-semibold text-sm">{pm.title}</p><p className="text-xs mt-0.5">{pm.desc}</p></div>
                </div>
              ))}
            </div>
            <div className={`flex items-center gap-2 p-3 rounded-xl border ${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'}`}>
              <span className="text-green-600 flex-shrink-0">{icons.shieldCheck}</span>
              <p className="text-xs">
                {tx(
                  "Toutes les transactions sont sécurisées par un chiffrement TLS 1.2+. Aucune donnée de carte bancaire n'est stockée sur nos serveurs.",
                  "All transactions are secured by TLS 1.2+ encryption. No bank card data is stored on our servers.",
                  "Alle Transaktionen sind durch TLS 1.2+-Verschlüsselung gesichert. Keine Bankdaten werden auf unseren Servern gespeichert."
                )}
              </p>
            </div>
          </div>
        </Section>

        {/* 5 */}
        <Section darkMode={darkMode} iconEl={icons.video} num="5" title={tx("Modalités de Prestation des Cours", "Course Delivery Terms", "Kurserbringungsmodalitäten")}>
          <div className={`space-y-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {[
              { iconEl: icons.shield, text: tx("Cours exclusivement en ligne via visioconférence (Zoom, Google Meet ou équivalent).", "Courses delivered exclusively online via video conference (Zoom, Google Meet or equivalent).", "Kurse ausschließlich online über Videokonferenz (Zoom, Google Meet oder ähnliches).") },
              { iconEl: icons.settings, text: tx("Le Client doit disposer d'un ordinateur (PC, Mac ou Chromebook) avec une connexion internet stable. Scratch et Python fonctionnent directement dans le navigateur.", "The Client must have a computer (PC, Mac or Chromebook) with a stable internet connection. Scratch and Python run directly in the browser.", "Der Kunde benötigt einen Computer (PC, Mac oder Chromebook) mit stabiler Internetverbindung. Scratch und Python laufen direkt im Browser.") },
              { iconEl: icons.parent, text: tx("Solo : 1 enfant. Duo : 2 enfants partageant la même séance. Premium : 1 enfant en mentorat individuel, 2 séances par semaine.", "Solo: 1 child. Duo: 2 children sharing the same session. Premium: 1 child in one-to-one mentoring, 2 sessions per week.", "Solo: 1 Kind. Duo: 2 Kinder, die dieselbe Sitzung teilen. Premium: 1 Kind im Einzelmentoring, 2 Sitzungen pro Woche.") },
              { iconEl: icons.calendar, text: tx("Horaires flexibles à convenir : du lundi au samedi, 09h00–20h00 (heure suisse). Stages : du lundi au vendredi sur les périodes de vacances scolaires.", "Flexible schedule: Monday to Saturday, 09:00–20:00 (Swiss time). Camps: Monday to Friday during school holidays.", "Flexible Zeiten: Montag bis Samstag, 09:00–20:00 (Schweizer Zeit). Camps: Montag bis Freitag in den Schulferien.") },
              { iconEl: icons.check, text: tx("Un certificat de réussite numérique est remis à chaque élève à l'issue de chaque parcours achevé. Pour les Premium : bilan vidéo personnalisé envoyé chaque mois aux parents.", "A digital certificate of achievement is issued to each student upon completion of each course. For Premium: personalised video report sent monthly to parents.", "Ein digitales Leistungszertifikat wird jedem Schüler nach Abschluss jedes Kurses ausgestellt. Für Premium: monatlicher personalisierter Videobericht an die Eltern.") },
            ].map((item, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <span className="text-[#232999] flex-shrink-0 mt-0.5">{item.iconEl}</span>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 6 */}
        <Section darkMode={darkMode} iconEl={icons.calendar} num="6" title={tx("Politique d'Annulation, Report et Garantie", "Cancellation, Rescheduling & Guarantee Policy", "Stornierung, Verschiebung und Garantie")}>
          <div className={`space-y-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>

            {/* 6.1 Garantie 1ère séance */}
            <div className={`rounded-xl border-2 p-4 ${darkMode ? 'bg-emerald-900/20 border-emerald-700' : 'bg-emerald-50 border-emerald-300'}`}>
              <h4 className={`font-bold mb-2 flex items-center gap-2 ${darkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>
                <span className="text-2xl">✓</span>
                {tx("6.1 Garantie satisfait ou remboursé (1ère séance)", "6.1 Money-back guarantee (1st session)", "6.1 Geld-zurück-Garantie (1. Sitzung)")}
              </h4>
              <p className="text-sm">
                {tx(
                  "Si vous n'êtes pas satisfait de votre 1ère séance, quelle qu'en soit la raison, vous pouvez demander le remboursement intégral de votre paiement initial dans les 7 jours suivant cette 1ère séance. La demande doit être formulée par email à contact@smartkids-school.ch. Cette garantie s'applique à TOUTES les formules (Solo, Duo, Premium, paiements totaux, et stages).",
                  "If you are not satisfied with your 1st session, for any reason, you can request a full refund of your initial payment within 7 days of this 1st session. The request must be made by email to contact@smartkids-school.ch. This guarantee applies to ALL packages (Solo, Duo, Premium, full payments, and camps).",
                  "Wenn Sie mit Ihrer 1. Sitzung nicht zufrieden sind, aus welchem Grund auch immer, können Sie innerhalb von 7 Tagen nach dieser 1. Sitzung eine vollständige Rückerstattung Ihrer Erstzahlung beantragen. Die Anfrage muss per E-Mail an contact@smartkids-school.ch erfolgen. Diese Garantie gilt für ALLE Pakete (Solo, Duo, Premium, Vollzahlungen und Camps)."
                )}
              </p>
            </div>

            {/* 6.2 Annulation abonnement sans engagement */}
            <div className={`rounded-xl border p-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {tx("6.2 Annulation de l'abonnement Premium sans engagement", "6.2 Cancellation of the no-commitment Premium subscription", "6.2 Kündigung des Premium-Abonnements ohne Bindung")}
              </h4>
              <p className="text-sm">
                {tx(
                  "Cette clause s'applique à l'offre Premium Mensuel (999 CHF/mois), seule formule sans engagement. Le Client peut annuler son abonnement à tout moment par email à contact@smartkids-school.ch. L'annulation prend effet à la fin du mois en cours déjà payé. Aucun remboursement partiel des séances non utilisées du mois en cours n'est accordé (sauf cas de force majeure).",
                  "This clause applies to the Premium Monthly plan (CHF 999/month), the only plan without a fixed commitment. The Client may cancel anytime by email to contact@smartkids-school.ch. Cancellation takes effect at the end of the current paid month. No partial refund of unused sessions of the current month is granted (except force majeure).",
                  "Diese Klausel gilt für das Premium-Monatsabo (999 CHF/Monat), das einzige Angebot ohne Bindung. Der Kunde kann sein Abonnement jederzeit per E-Mail kündigen. Die Kündigung wird am Ende des laufenden bezahlten Monats wirksam. Keine teilweise Rückerstattung nicht genutzter Sitzungen des laufenden Monats (außer höhere Gewalt)."
                )}
              </p>
            </div>

            {/* 6.3 Annulation engagement 6/12 mois */}
            <div className={`rounded-xl border p-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {tx("6.3 Annulation d'un abonnement avec engagement (3, 6 ou 12 mois)", "6.3 Cancellation of subscription with commitment (3, 6 or 12 months)", "6.3 Kündigung eines Abonnements mit Bindung (3, 6 oder 12 Monate)")}
              </h4>
              <p className="text-sm">
                {tx(
                  "En souscrivant à une formule avec engagement, le Client s'engage à régler la totalité des mensualités sur la durée choisie. En cas d'annulation anticipée par le Client (hors garantie 1ère séance) :",
                  "By subscribing to a commitment plan, the Client agrees to pay all monthly fees for the chosen duration. In case of early cancellation by the Client (excluding 1st-session guarantee):",
                  "Mit dem Abschluss eines Bindungspakets verpflichtet sich der Kunde, alle monatlichen Gebühren für die gewählte Dauer zu begleichen. Bei vorzeitiger Kündigung durch den Kunden (außer 1.-Sitzung-Garantie):"
                )}
              </p>
              <ul className="space-y-1 ml-4 mt-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-amber-600 flex-shrink-0">•</span>
                  <span>{tx("Les mensualités déjà versées ne sont pas remboursées.", "Already-paid monthly fees are non-refundable.", "Bereits gezahlte monatliche Gebühren sind nicht erstattungsfähig.")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-600 flex-shrink-0">•</span>
                  <span>{tx("Les mensualités restantes jusqu'à la fin de la période d'engagement restent dues, sauf accord exceptionnel de SKS.", "Remaining monthly fees until the end of the commitment period are still due, unless exceptional agreement by SKS.", "Verbleibende monatliche Gebühren bis zum Ende der Bindungsperiode bleiben fällig, außer bei außergewöhnlicher Vereinbarung durch SKS.")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-600 flex-shrink-0">✓</span>
                  <span>{tx("Cas exceptionnels (déménagement à l'étranger, problème de santé majeur, force majeure) : SKS étudie chaque demande et peut accorder une suspension ou une rupture sans frais sur présentation de justificatifs.", "Exceptional cases (move abroad, major health issue, force majeure): SKS reviews each request and may grant suspension or termination without fees, with supporting documents.", "Ausnahmefälle (Umzug ins Ausland, schwere Krankheit, höhere Gewalt): SKS prüft jeden Antrag und kann Aussetzung oder Beendigung ohne Gebühren mit Nachweisen gewähren.")}</span>
                </li>
              </ul>
            </div>

            {/* 6.4 Annulation paiement total */}
            <div className={`rounded-xl border p-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {tx("6.4 Annulation d'un paiement total (option avec rabais)", "6.4 Cancellation of total payment (discounted option)", "6.4 Kündigung einer Gesamtzahlung (Rabattoption)")}
              </h4>
              <p className="text-sm">
                {tx(
                  "Le paiement total en une fois (environ -10% par rapport au paiement mensuel, quelle que soit la durée : 3, 6 ou 12 mois) est ferme et définitif. Aucun remboursement n'est possible une fois la 1ère séance suivie, hors application de la garantie 1ère séance (Section 6.1) ou cas exceptionnel évalué au cas par cas.",
                  "The one-time full payment (approximately -10% compared to the monthly payment, regardless of duration: 3, 6 or 12 months) is firm and final. No refund is possible after the 1st session, except for the 1st-session guarantee (Section 6.1) or exceptional case evaluated individually.",
                  "Die Vollzahlung auf einmal (ca. -10% gegenüber der monatlichen Zahlung, unabhängig von der Dauer: 3, 6 oder 12 Monate) ist verbindlich und endgültig. Keine Rückerstattung nach der 1. Sitzung, außer 1.-Sitzung-Garantie (Abschnitt 6.1) oder Ausnahmefall im Einzelfall."
                )}
              </p>
            </div>

            {/* 6.5 Stages */}
            <div className={`rounded-xl border p-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {tx("6.5 Annulation d'un stage vacances", "6.5 Vacation camp cancellation", "6.5 Stornierung eines Ferien-Camps")}
              </h4>
              <ul className="space-y-1 ml-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-emerald-600 flex-shrink-0">✓</span>
                  <span>{tx("Plus de 14 jours avant le début du stage : remboursement intégral.", "More than 14 days before the camp start: full refund.", "Mehr als 14 Tage vor Camp-Beginn: vollständige Rückerstattung.")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-600 flex-shrink-0">•</span>
                  <span>{tx("Entre 7 et 14 jours avant : remboursement à 50%.", "Between 7 and 14 days before: 50% refund.", "Zwischen 7 und 14 Tagen vorher: 50% Rückerstattung.")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 flex-shrink-0">•</span>
                  <span>{tx("Moins de 7 jours avant ou stage commencé : aucun remboursement (hors force majeure).", "Less than 7 days before or after camp start: no refund (except force majeure).", "Weniger als 7 Tage vorher oder nach Camp-Beginn: keine Rückerstattung (außer höhere Gewalt).")}</span>
                </li>
              </ul>
            </div>

            {/* 6.6 Report d'une séance */}
            <div className={`rounded-xl border p-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {tx("6.6 Report d'une séance individuelle", "6.6 Rescheduling of an individual session", "6.6 Verschiebung einer einzelnen Sitzung")}
              </h4>
              <p className="text-sm">
                {tx(
                  "Toute demande de report d'une séance doit être effectuée au moins 24 heures à l'avance par email à contact@smartkids-school.ch. En dessous de ce délai, la séance est considérée comme utilisée (sauf force majeure justifiée).",
                  "Any rescheduling request must be made at least 24 hours in advance by email to contact@smartkids-school.ch. Below this deadline, the session is considered used (except justified force majeure).",
                  "Verschiebungsanträge müssen mindestens 24 Stunden im Voraus per E-Mail gestellt werden. Andernfalls gilt die Sitzung als genutzt (außer begründete höhere Gewalt)."
                )}
              </p>
            </div>

            {/* 6.7 Annulation par SKS */}
            <div className={`rounded-xl border p-4 ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                {tx("6.7 Annulation par Smart Kids School", "6.7 Cancellation by Smart Kids School", "6.7 Stornierung durch Smart Kids School")}
              </h4>
              <p className="text-sm">
                {tx(
                  "Dans le cas exceptionnel où SKS doit annuler définitivement les cours d'un Client (par exemple : impossibilité d'assurer la prestation pour des raisons indépendantes de notre volonté), le Client bénéficie du remboursement intégral des sommes versées et non utilisées, majoré de 10% à titre d'indemnité.",
                  "In the exceptional case where SKS must definitively cancel a Client's courses (e.g.: inability to provide the service for reasons beyond our control), the Client receives a full refund of unused amounts paid, plus 10% as compensation.",
                  "Im Ausnahmefall, dass SKS die Kurse eines Kunden endgültig absagen muss (z.B.: Unfähigkeit, die Dienstleistung aus Gründen außerhalb unseres Einflusses zu erbringen), erhält der Kunde eine vollständige Rückerstattung der nicht genutzten gezahlten Beträge plus 10% als Entschädigung."
                )}
              </p>
            </div>

            <p className="text-xs italic mt-3">
              {tx(
                "Les remboursements sont effectués sur le moyen de paiement original dans un délai de 5 à 10 jours ouvrables.",
                "Refunds are made to the original payment method within 5 to 10 business days.",
                "Rückerstattungen erfolgen auf das ursprüngliche Zahlungsmittel innerhalb von 5–10 Werktagen."
              )}
            </p>
          </div>
        </Section>

        {/* 7 */}
        <Section darkMode={darkMode} iconEl={icons.back} num="7" title={tx("Droit de Rétractation", "Right of Withdrawal", "Widerrufsrecht")}>
          <div className={`space-y-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>
              {tx(
                "Conformément aux principes du droit suisse de la consommation (CO art. 40a et suivants), le Client dispose d'un délai de 14 jours calendaires à compter de la date d'achat pour exercer son droit de rétractation.",
                "In accordance with Swiss consumer law principles (CO art. 40a et seq.), the Client has 14 calendar days from the date of purchase to exercise their right of withdrawal.",
                "Gemäß dem Schweizer Konsumentenrecht (OR Art. 40a ff.) hat der Kunde ab dem Kaufdatum 14 Kalendertage, um sein Widerrufsrecht auszuüben."
              )}
            </p>
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-amber-900/20 border-amber-700' : 'bg-amber-50 border-amber-200'}`}>
              <p className={`font-semibold mb-1 flex items-center gap-2 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                <span>{icons.alert}</span>
                {tx("Exception importante", "Important exception", "Wichtige Ausnahme")}
              </p>
              <p className={darkMode ? 'text-amber-200' : 'text-amber-700'}>
                {tx(
                  "Le droit de rétractation ne s'applique plus dès lors que le premier cours a été dispensé, si le Client a expressément accepté que la prestation commence avant l'expiration du délai.",
                  "The right of withdrawal no longer applies once the first session has been delivered, if the Client expressly agreed that the service begins before the end of the withdrawal period.",
                  "Das Widerrufsrecht gilt nicht mehr, sobald die erste Sitzung abgehalten wurde und der Kunde ausdrücklich zugestimmt hat."
                )}
              </p>
            </div>
          </div>
        </Section>

        {/* 8 */}
        <Section darkMode={darkMode} iconEl={icons.settings} num="8" title={tx("Obligations du Client", "Client Obligations", "Pflichten des Kunden")}>
          <div className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {[
              tx("Fournir des informations exactes lors de l'inscription.", "Provide accurate information during enrollment.", "Genaue Informationen bei der Anmeldung angeben."),
              tx("S'assurer que l'enfant dispose d'un environnement calme et propice à l'apprentissage.", "Ensure the child has a quiet, learning-conducive environment.", "Sicherstellen, dass das Kind eine ruhige Lernumgebung hat."),
              tx("Respecter les horaires convenus et prévenir en cas d'empêchement avec un préavis d'au moins 24 heures.", "Respect agreed schedules and notify at least 24 hours in advance.", "Vereinbarte Zeiten einhalten und mindestens 24 Stunden vorher informieren."),
              tx("Ne pas enregistrer, reproduire ou distribuer les contenus des cours sans autorisation écrite préalable.", "Not record, reproduce or distribute course content without prior written authorization.", "Kursinhalte ohne Genehmigung nicht aufzeichnen oder verteilen."),
              tx("Adopter un comportement respectueux. SKS se réserve le droit d'exclure tout élève dont le comportement perturberait les cours, sans remboursement.", "Behave respectfully. SKS reserves the right to exclude any disruptive student without refund.", "Respektvolles Verhalten. SKS behält sich vor, störende Schüler ohne Rückerstattung auszuschließen."),
            ].map((item, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <span className="text-[#232999] flex-shrink-0 mt-0.5">{icons.check}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 9 */}
        <Section darkMode={darkMode} iconEl={icons.copyright} num="9" title={tx("Propriété Intellectuelle", "Intellectual Property", "Geistiges Eigentum")}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {tx(
              "L'intégralité des supports pédagogiques créés par Smart Kids School sont sa propriété exclusive. Toute reproduction sans autorisation écrite est interdite. L'achat d'un cours confère un droit d'usage personnel et non-transférable pour la durée du cours uniquement. Scratch® est une marque déposée du MIT.",
              "All educational materials created by Smart Kids School are its exclusive property. Any reproduction without written authorization is prohibited. Purchasing a course grants a personal, non-transferable right of use for the course duration only. Scratch® is a registered trademark of MIT.",
              "Alle Lernmaterialien von Smart Kids School sind ihr ausschließliches Eigentum. Jede Reproduktion ohne Genehmigung ist verboten. Der Kauf gewährt nur für die Kursdauer ein persönliches, nicht übertragbares Nutzungsrecht. Scratch® ist eine eingetragene Marke des MIT."
            )}
          </p>
        </Section>

        {/* 10 */}
        <Section darkMode={darkMode} iconEl={icons.scales} num="10" title={tx("Responsabilité & Force Majeure", "Liability & Force Majeure", "Haftung & Höhere Gewalt")}>
          <div className={`space-y-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>
              {tx(
                "La responsabilité de SKS est expressément limitée au montant payé pour le service concerné. En cas de force majeure, SKS s'engage à reporter les séances sans frais ou à proposer un remboursement partiel si le report est impossible.",
                "SKS's liability is expressly limited to the amount paid for the service. In case of force majeure, SKS will reschedule sessions at no cost or offer a partial refund if rescheduling is impossible.",
                "Die Haftung von SKS ist auf den gezahlten Betrag begrenzt. Bei höherer Gewalt werden Sitzungen kostenlos verschoben oder anteilig erstattet."
              )}
            </p>
          </div>
        </Section>

        {/* 11 */}
        <Section darkMode={darkMode} iconEl={icons.parent} num="11" title={tx("Protection des Mineurs", "Protection of Minors", "Schutz von Minderjährigen")}>
          <div className={`space-y-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>
              {tx(
                "Les cours sont destinés aux enfants de 7 à 15 ans. La commande doit être effectuée par un adulte détenteur de l'autorité parentale. SKS s'engage à maintenir un environnement d'apprentissage sûr et adapté à l'âge des enfants.",
                "Courses are for children aged 6–15. Orders must be placed by an adult with parental authority. SKS is committed to maintaining a safe, age-appropriate learning environment.",
                "Kurse richten sich an Kinder von 6–15 Jahren. Bestellungen müssen von einem Erziehungsberechtigten aufgegeben werden. SKS gewährleistet eine sichere Lernumgebung."
              )}
            </p>
          </div>
        </Section>

        {/* 12 */}
        <Section darkMode={darkMode} iconEl={icons.gov} num="12" title={tx("Droit Applicable & Litiges", "Applicable Law & Disputes", "Anwendbares Recht & Streitigkeiten")}>
          <div className={`space-y-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>
              {tx(
                "Les présentes CGV sont soumises au droit suisse. En cas de litige, les parties cherchent en priorité une résolution amiable. À défaut, le litige sera soumis aux tribunaux du canton de Vaud (Suisse).",
                "These Terms are subject to Swiss law. In case of dispute, parties first seek an amicable resolution. Otherwise, the courts of the Canton of Vaud (Switzerland) have jurisdiction.",
                "Diese AGB unterliegen dem Schweizer Recht. Im Streitfall wird zunächst eine gütliche Einigung gesucht. Andernfalls sind die Gerichte des Kantons Waadt zuständig."
              )}
            </p>
            <div className={`flex items-start gap-3 p-4 rounded-xl border ${darkMode ? 'bg-indigo-900/30 border-indigo-700' : 'bg-indigo-50 border-indigo-200'}`}>
              <span className="text-[#232999] flex-shrink-0 mt-0.5">{icons.headphones}</span>
              <div>
                <p className={`font-semibold mb-1 ${darkMode ? 'text-indigo-300' : 'text-indigo-800'}`}>{tx("Nous contacter avant tout recours", "Contact us before any recourse", "Kontakt vor jedem Rechtsmittel")}</p>
                <p className={darkMode ? 'text-indigo-200' : 'text-indigo-700'}>
                  {tx("Pour toute réclamation : ", "For any complaint: ", "Bei Beschwerden: ")}
                  <a href="mailto:contact@smartkids-school.ch" className="text-[#232999] hover:underline font-semibold">contact@smartkids-school.ch</a>
                  {tx(", Réponse garantie sous 48h ouvrables.", ", Response within 48 business hours.", ", Antwort innerhalb von 48 Geschäftsstunden.")}
                </p>
              </div>
            </div>
          </div>
        </Section>

      </main>
      <Footer currentLang={lang} darkMode={darkMode} />
      <CookieBanner currentLang={lang} darkMode={darkMode} />
      {/* ── WhatsApp Floating Button (compact, style Stripe/Apple) ── */}
      <a
        href="https://wa.me/41774768492"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-full shadow-xl hover:shadow-green-400/50 transition-all duration-300 hover:scale-110 group"
        title={lang === 'FR' ? 'Nous contacter sur WhatsApp' : lang === 'EN' ? 'Contact us on WhatsApp' : 'Kontaktieren Sie uns auf WhatsApp'}
        aria-label={lang === 'FR' ? 'Contacter sur WhatsApp' : 'Contact WhatsApp'}
        style={{ animation: 'whatsapp-pulse 2.5s ease-in-out infinite' }}
      >
        <style>{`
          @keyframes whatsapp-pulse {
            0%, 100% { box-shadow: 0 4px 14px rgba(37, 211, 102, 0.4), 0 0 0 0 rgba(37, 211, 102, 0.6); }
            50% { box-shadow: 0 4px 14px rgba(37, 211, 102, 0.4), 0 0 0 12px rgba(37, 211, 102, 0); }
          }
        `}</style>
        <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
        </svg>
      </a>

    </div>
  );
}
