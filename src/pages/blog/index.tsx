import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import CookieBanner from '../../components/CookieBanner';
import { parseLocaleFromPath, localizedPath, setHreflangTags, type Locale } from '../../i18n/routing';
import { getAllArticles } from '../../lib/blog';

type Lang = Locale;

const T: Record<Lang, {
  pageTitle: string;
  pageSubtitle: string;
  readMore: string;
  minRead: (n: number) => string;
  navHome: string; navProgramme: string; navTarifs: string; navPremium: string; navStages: string; navFaq: string; navBlog: string; navEnroll: string;
}> = {
  FR: {
    pageTitle: 'Le blog Smart Kids School',
    pageSubtitle: "Conseils, repères et retours d'expérience pour accompagner votre enfant dans son apprentissage du code.",
    readMore: 'Lire l’article',
    minRead: (n) => `${n} min de lecture`,
    navHome: 'Accueil', navProgramme: 'Programme', navTarifs: 'Tarifs', navPremium: 'Premium', navStages: 'Stages', navFaq: 'FAQ', navBlog: 'Blog', navEnroll: 'Inscrire mon enfant',
  },
  EN: {
    pageTitle: 'The Smart Kids School blog',
    pageSubtitle: "Advice, benchmarks and lessons learned to support your child's coding journey.",
    readMore: 'Read the article',
    minRead: (n) => `${n} min read`,
    navHome: 'Home', navProgramme: 'Programme', navTarifs: 'Pricing', navPremium: 'Premium', navStages: 'Camps', navFaq: 'FAQ', navBlog: 'Blog', navEnroll: 'Enroll my child',
  },
  DE: {
    pageTitle: 'Der Smart Kids School Blog',
    pageSubtitle: 'Tipps, Orientierungshilfen und Erfahrungsberichte, um Ihr Kind beim Programmieren-Lernen zu begleiten.',
    readMore: 'Artikel lesen',
    minRead: (n) => `${n} Min. Lesezeit`,
    navHome: 'Startseite', navProgramme: 'Programm', navTarifs: 'Preise', navPremium: 'Premium', navStages: 'Camps', navFaq: 'FAQ', navBlog: 'Blog', navEnroll: 'Kind anmelden',
  },
};

export default function BlogIndex() {
  const [currentLang, setCurrentLang] = useState<Lang>(() => parseLocaleFromPath(window.location.pathname).locale);
  const navigate = useNavigate();
  const lp = (path: string) => localizedPath(path, currentLang);
  const [darkMode, setDarkMode] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      setDarkMode(localStorage.getItem('sks_theme') === 'dark');
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sks_lang', currentLang);
      localStorage.setItem('sks_theme', darkMode ? 'dark' : 'light');
    } catch {}
    document.documentElement.classList.toggle('dark', darkMode);
  }, [currentLang, darkMode]);

  const t = T[currentLang];
  const articles = getAllArticles(currentLang);

  // SEO
  useEffect(() => {
    const titles: Record<Lang, string> = {
      FR: 'Blog, Smart Kids School | Conseils pour apprendre le code aux enfants',
      EN: 'Blog, Smart Kids School | Advice on teaching kids to code',
      DE: 'Blog, Smart Kids School | Tipps zum Programmieren-Lernen für Kinder',
    };
    document.title = titles[currentLang];
    const setMeta = (name: string, content: string, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.content = content;
    };
    setMeta('description', currentLang === 'FR' ? "Le blog Smart Kids School : conseils, repères par âge et retours d'expérience sur l'apprentissage du code pour enfants." : currentLang === 'EN' ? "The Smart Kids School blog: advice, age benchmarks and lessons learned about teaching kids to code." : 'Der Smart Kids School Blog: Tipps, Altersrichtwerte und Erfahrungen rund ums Programmieren-Lernen für Kinder.');
    setMeta('og:title', titles[currentLang], 'property');
    setMeta('og:url', `https://smartkids-school.ch${localizedPath('/blog', currentLang)}`, 'property');
    setHreflangTags('/blog', currentLang);

    let ldEl = document.querySelector('script[type="application/ld+json"][data-sks="blog"]') as HTMLScriptElement;
    if (!ldEl) {
      ldEl = document.createElement('script');
      ldEl.type = 'application/ld+json';
      ldEl.setAttribute('data-sks', 'blog');
      document.head.appendChild(ldEl);
    }
    ldEl.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: titles[currentLang],
      url: `https://smartkids-school.ch${localizedPath('/blog', currentLang)}`,
      blogPost: articles.map(a => ({
        '@type': 'BlogPosting',
        headline: a.title,
        description: a.description,
        datePublished: a.date,
        url: `https://smartkids-school.ch${localizedPath(`/blog/${a.slug}`, currentLang)}`,
      })),
    });
  }, [currentLang, articles]);

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
              <a href={lp('/premium')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.navPremium}</a>
              <a href={lp('/faq')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.navFaq}</a>
              <a href={lp('/blog')} className="text-sm font-semibold text-[#232999]">{t.navBlog}</a>
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
                      <button key={lang} onClick={() => { setCurrentLang(lang); setShowLangDropdown(false); navigate(localizedPath('/blog', lang)); }} className={`w-full px-4 py-2.5 text-sm text-left transition-colors cursor-pointer ${currentLang === lang ? 'bg-[#232999] text-white font-semibold' : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-indigo-50'}`}>
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
              <a href={lp('/premium')} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.navPremium}</a>
              <a href={lp('/faq')} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.navFaq}</a>
              <a href={lp('/blog')} className="block text-sm font-semibold py-2 text-[#232999]">{t.navBlog}</a>
              <div className="flex gap-2 py-2">
                {(['FR', 'EN', 'DE'] as Lang[]).map(lang => (
                  <button key={lang} onClick={() => { setCurrentLang(lang); navigate(localizedPath('/blog', lang)); }} className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${currentLang === lang ? 'bg-[#232999] text-white' : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{lang}</button>
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
          <span className={`px-4 py-2 rounded-full text-sm font-semibold inline-block ${darkMode ? 'bg-indigo-900/60 text-indigo-300' : 'bg-indigo-100 text-indigo-800'}`}>📝 Blog</span>
          <h1 className={`text-4xl lg:text-5xl font-bold leading-tight mt-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.pageTitle}</h1>
          <p className={`text-lg mt-4 max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.pageSubtitle}</p>
        </div>
      </section>

      {/* ── Grille d'articles ── */}
      <section className={`py-12 px-4 ${darkMode ? 'bg-gray-950' : 'bg-gradient-to-br from-slate-50 to-white'}`}>
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-6">
          {articles.map(a => (
            <a
              key={a.slug}
              href={lp(`/blog/${a.slug}`)}
              className={`group flex flex-col p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${darkMode ? 'border-gray-700 bg-gray-800/50 hover:border-indigo-400' : 'border-gray-200 bg-white hover:border-[#232999]'}`}
            >
              <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-indigo-400' : 'text-[#232999]'}`}>
                {new Date(a.date).toLocaleDateString(currentLang === 'FR' ? 'fr-CH' : currentLang === 'EN' ? 'en-GB' : 'de-CH', { day: 'numeric', month: 'long', year: 'numeric' })}
                {' · '}{t.minRead(a.readTimeMinutes)}
              </span>
              <h2 className={`text-xl font-bold mt-3 mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{a.title}</h2>
              <p className={`text-sm leading-relaxed flex-grow ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{a.excerpt}</p>
              <span className={`mt-4 text-sm font-semibold inline-flex items-center gap-1 ${darkMode ? 'text-indigo-400' : 'text-[#232999]'}`}>
                {t.readMore}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ── WhatsApp Floating Button ── */}
      <a
        href="https://wa.me/41774768492"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-full shadow-xl hover:shadow-green-400/50 transition-all duration-300 hover:scale-110 group"
        title={currentLang === 'FR' ? 'Nous contacter sur WhatsApp' : currentLang === 'EN' ? 'Contact us on WhatsApp' : 'Kontaktieren Sie uns auf WhatsApp'}
        aria-label={currentLang === 'FR' ? 'Contacter sur WhatsApp' : 'Contact WhatsApp'}
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
        </svg>
      </a>

      {/* ── Footer ── */}
      <Footer currentLang={currentLang} darkMode={darkMode} />
      <CookieBanner currentLang={currentLang} darkMode={darkMode} />
    </div>
  );
}
