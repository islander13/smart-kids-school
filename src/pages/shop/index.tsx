import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import CookieBanner from '../../components/CookieBanner';
import { parseLocaleFromPath, localizedPath, setHreflangTags, type Locale } from '../../i18n/routing';
import { SHOP_PRODUCTS } from '../../lib/shopCatalog';

// ─────────────────────────────────────────────────────────────────────────
// Page liste de la boutique — PAS ENCORE BRANCHÉE au routeur (voir
// src/router/config.tsx) ni à la navigation du site. Code prêt, contenu
// des produits à finaliser (voir src/lib/shopCatalog.ts).
// ─────────────────────────────────────────────────────────────────────────

type Lang = Locale;

const T: Record<Lang, {
  pageTitle: string;
  pageSubtitle: string;
  discover: string;
  navHome: string; navProgramme: string; navTarifs: string; navStages: string; navFaq: string; navBlog: string; navEnroll: string;
}> = {
  FR: {
    pageTitle: 'Boutique',
    pageSubtitle: 'Nos ressources à télécharger pour prolonger l’apprentissage à la maison.',
    discover: 'Découvrir',
    navHome: 'Accueil', navProgramme: 'Programme', navTarifs: 'Tarifs', navStages: 'Stages', navFaq: 'FAQ', navBlog: 'Blog', navEnroll: 'Inscrire mon enfant',
  },
  EN: {
    pageTitle: 'Shop',
    pageSubtitle: 'Downloadable resources to extend learning at home.',
    discover: 'Discover',
    navHome: 'Home', navProgramme: 'Programme', navTarifs: 'Pricing', navStages: 'Camps', navFaq: 'FAQ', navBlog: 'Blog', navEnroll: 'Enroll my child',
  },
  DE: {
    pageTitle: 'Shop',
    pageSubtitle: 'Herunterladbare Ressourcen, um das Lernen zu Hause fortzusetzen.',
    discover: 'Entdecken',
    navHome: 'Startseite', navProgramme: 'Programm', navTarifs: 'Preise', navStages: 'Camps', navFaq: 'FAQ', navBlog: 'Blog', navEnroll: 'Kind anmelden',
  },
};

export default function ShopIndex() {
  const [currentLang, setCurrentLang] = useState<Lang>(() => parseLocaleFromPath(window.location.pathname).locale);
  const navigate = useNavigate();
  const lp = (path: string) => localizedPath(path, currentLang);
  const [darkMode, setDarkMode] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try { setDarkMode(localStorage.getItem('sks_theme') === 'dark'); } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sks_lang', currentLang);
      localStorage.setItem('sks_theme', darkMode ? 'dark' : 'light');
    } catch {}
    document.documentElement.classList.toggle('dark', darkMode);
  }, [currentLang, darkMode]);

  const t = T[currentLang];

  useEffect(() => {
    document.title = `${t.pageTitle} | Smart Kids School`;
    setHreflangTags('/shop', currentLang);
  }, [currentLang, t.pageTitle]);

  return (
    <div className={`min-h-screen font-['Inter',sans-serif] transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
      {/* ── Navigation (identique aux autres pages) ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm shadow-sm transition-colors duration-300 ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center gap-3">
              <a href={lp('/')}><img src="/Logo_official_dark.png" alt="Smart Kids School" width="192" height="64" className="h-16 w-auto" /></a>
              <img src="/flag-ch.png" alt="Drapeau de la Suisse" width="24" height="24" className="h-6 w-auto flex-shrink-0 shadow-sm rounded-sm" />
            </div>
            <div className="hidden md:flex items-center gap-8 ml-8">
              <a href={lp('/')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.navHome}</a>
              <a href={lp('/#parcours')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.navProgramme}</a>
              <a href={lp('/tarifs')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.navTarifs}</a>
              <a href={lp('/stages')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.navStages}</a>
              <a href={lp('/faq')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.navFaq}</a>
              <a href={lp('/blog')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.navBlog}</a>
              <a href={lp('/shop')} className="text-sm font-semibold text-[#232999]">{t.pageTitle}</a>
            </div>
            <div className="hidden md:flex items-center gap-3 ml-6">
              <button onClick={() => setDarkMode(!darkMode)} className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-300 cursor-pointer ${darkMode ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-100 border-gray-200 text-gray-700 hover:border-indigo-400'}`}>
                {darkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
              </button>
              <div className="relative">
                <button onClick={() => setShowLangDropdown(!showLangDropdown)} className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors cursor-pointer ${darkMode ? 'border-gray-600 hover:border-indigo-400 text-gray-300' : 'border-gray-200 hover:border-indigo-400 text-gray-700'}`}>
                  <span className="text-sm font-medium">{currentLang}</span>
                  <i className={`ri-arrow-down-s-line transition-transform ${showLangDropdown ? 'rotate-180' : ''} ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}></i>
                </button>
                {showLangDropdown && (
                  <div className={`absolute top-full right-0 mt-2 rounded-lg shadow-lg border overflow-hidden z-50 min-w-[80px] ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    {(['FR', 'EN', 'DE'] as Lang[]).map(lang => (
                      <button key={lang} onClick={() => { setCurrentLang(lang); setShowLangDropdown(false); navigate(localizedPath('/shop', lang)); }} className={`w-full px-4 py-2.5 text-sm text-left transition-colors cursor-pointer ${currentLang === lang ? 'bg-[#232999] text-white font-semibold' : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-indigo-50'}`}>
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <a href={lp('/tarifs')} className="bg-[#232999] hover:bg-[#1a1f7a] text-white px-6 py-3 rounded-full text-sm font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 whitespace-nowrap">{t.navEnroll}</a>
            </div>
            <div className="md:hidden flex items-center gap-2">
              <button onClick={() => setDarkMode(!darkMode)} aria-label="Toggle theme" className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 cursor-pointer ${darkMode ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-100 border-gray-200 text-gray-700'}`}>
                {darkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`p-2 rounded-lg transition-colors cursor-pointer ${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {mobileMenuOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>}
                </svg>
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className={`md:hidden border-t ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="px-4 py-4 space-y-3">
              <a href={lp('/')} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.navHome}</a>
              <a href={lp('/#parcours')} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.navProgramme}</a>
              <a href={lp('/tarifs')} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.navTarifs}</a>
              <a href={lp('/stages')} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.navStages}</a>
              <a href={lp('/faq')} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.navFaq}</a>
              <a href={lp('/blog')} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.navBlog}</a>
              <a href={lp('/shop')} className="block text-sm font-semibold py-2 text-[#232999]">{t.pageTitle}</a>
              <div className="flex gap-2 py-2">
                {(['FR', 'EN', 'DE'] as Lang[]).map(lang => (
                  <button key={lang} onClick={() => { setCurrentLang(lang); navigate(localizedPath('/shop', lang)); }} className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${currentLang === lang ? 'bg-[#232999] text-white' : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{lang}</button>
                ))}
              </div>
              <a href={lp('/tarifs')} className="block w-full bg-[#232999] text-white px-6 py-3 rounded-full text-sm font-semibold text-center">{t.navEnroll}</a>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className={`relative pt-32 pb-12 px-4 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800' : 'bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-50'}`}>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold inline-block ${darkMode ? 'bg-indigo-900/60 text-indigo-300' : 'bg-indigo-100 text-indigo-800'}`}>🛒 {t.pageTitle}</span>
          <h1 className={`text-4xl lg:text-5xl font-bold leading-tight mt-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.pageTitle}</h1>
          <p className={`text-lg mt-4 max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.pageSubtitle}</p>
        </div>
      </section>

      {/* ── Grille de produits ── */}
      <section className={`py-12 px-4 ${darkMode ? 'bg-gray-950' : 'bg-gradient-to-br from-slate-50 to-white'}`}>
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-6">
          {SHOP_PRODUCTS.map(product => (
            <a
              key={product.slug}
              href={lp(`/shop/${product.slug}`)}
              className={`group flex flex-col p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${darkMode ? 'border-gray-700 bg-gray-800/50 hover:border-indigo-400' : 'border-gray-200 bg-white hover:border-[#232999]'}`}
            >
              <div className="text-5xl mb-4">{product.emoji}</div>
              <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.title[currentLang]}</h2>
              <p className={`text-sm leading-relaxed flex-grow ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{product.tagline[currentLang]}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className={`text-lg font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.priceCHF} CHF</span>
                <span className={`text-sm font-semibold inline-flex items-center gap-1 ${darkMode ? 'text-indigo-400' : 'text-[#232999]'}`}>
                  {t.discover}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <Footer currentLang={currentLang} darkMode={darkMode} />
      <CookieBanner currentLang={currentLang} darkMode={darkMode} />
    </div>
  );
}
