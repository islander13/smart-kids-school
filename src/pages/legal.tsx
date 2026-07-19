import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import CookieBanner from '../components/CookieBanner';
import { parseLocaleFromPath, localizedPath, setHreflangTags } from '../i18n/routing';

type Lang = 'FR' | 'EN' | 'DE';

// ── Inline SVG icons (no external font needed) ────────────────────────────
const icons = {
  building:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  user:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  server:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>,
  payment:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  lock:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  shield:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  link:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  copyright:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M14.83 14.83A4 4 0 1 1 14.83 9.17"/></svg>,
  info:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  scales:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 9l4-4 4 4M17 15l4 4-4 4"/><line x1="3" y1="21" x2="21" y2="21"/></svg>,
  eye:         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  edit:        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash:       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>,
  export:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  forbid:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  pause:       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  mail:        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  headphones:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,
  sun:         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon:        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  chevron:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
};

function Section({ darkMode, iconEl, title, children }: { darkMode: boolean; iconEl: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className={`rounded-2xl border p-8 mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h2 className={`text-xl font-bold mb-5 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        <span className="text-[#232999]">{iconEl}</span> {title}
      </h2>
      {children}
    </section>
  );
}

export default function LegalNotice() {
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
      FR: 'Mentions Légales | Smart Kids School',
      EN: 'Legal Notice | Smart Kids School',
      DE: 'Impressum | Smart Kids School',
    };
    const descs: Record<Lang, string> = {
      FR: 'Mentions légales de Smart Kids School, école de programmation en ligne pour enfants en Suisse. Éditeur, hébergeur, données personnelles, cookies.',
      EN: "Legal notice of Smart Kids School, online programming school for children in Switzerland. Publisher, hosting, personal data, cookies.",
      DE: 'Impressum von Smart Kids School, Online-Programmierschule für Kinder in der Schweiz. Herausgeber, Hosting, personenbezogene Daten, Cookies.',
    };
    document.title = titles[lang];
    setMeta('description', descs[lang]);
    setMeta('robots', 'index, follow');
    setMeta('og:title', titles[lang], 'property');
    setMeta('og:description', descs[lang], 'property');
    setMeta('og:url', `https://smartkids-school.ch${localizedPath('/legal', lang)}`, 'property');
    setHreflangTags('/legal', lang);
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
              <a href={lp('/')}><img src="Logo_official_dark.png" alt="Smart Kids School" width="192" height="64" className="h-16 w-auto" /></a>
              <img src="flag-ch.png" alt="Drapeau de la Suisse" width="24" height="24" className="h-6 w-auto flex-shrink-0 shadow-sm rounded-sm" />
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8 ml-8">
              <a href={lp('/')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{tx('Accueil', 'Home', 'Startseite')}</a>
              <a href={lp('/tarifs')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{tx('Tarifs', 'Pricing', 'Preise')}</a>
              <a href={lp('/stages')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{tx('Stages', 'Camps', 'Camps')}</a>
              <a href={lp('/faq')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>FAQ</a>
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
                      <button key={l} onClick={() => { setLang(l); setShowLangDropdown(false); navigate(localizedPath('/legal', l)); }}
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
              <a href={lp('/faq')} onClick={() => setMobileMenuOpen(false)} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>FAQ</a>
              <div className="flex gap-2 py-2">
                {(['FR', 'EN', 'DE'] as Lang[]).map(l => (
                  <button key={l} onClick={() => { setLang(l); setMobileMenuOpen(false); navigate(localizedPath('/legal', l)); }} className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${lang === l ? 'bg-[#232999] text-white' : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{l}</button>
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
            {tx('Mentions Légales', 'Legal Notice', 'Impressum')}
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {tx('Dernière mise à jour : mars 2026', 'Last updated: March 2026', 'Zuletzt aktualisiert: März 2026')}
          </p>
        </div>

        {/* 1. Identité */}
        <section className={`rounded-2xl border p-8 mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className="text-[#232999]">{icons.building}</span>
            {tx("Informations sur l'entreprise", 'Company Information', 'Unternehmensinformationen')}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { label: tx('Forme juridique', 'Legal form', 'Rechtsform'), value: tx('Raison individuelle (entreprise individuelle)', 'Sole proprietorship', 'Einzelunternehmen') },
              { label: tx('Nom commercial', 'Trade name', 'Handelsname'), value: 'Smart Kids School (SKS)' },
              { label: tx('Siège social', 'Registered address', 'Sitz'), value: "Avenue d'Echallens 60, 1004 Lausanne, Suisse" },
              { label: tx("Canton d'enregistrement", 'Registration canton', 'Kanton'), value: 'Vaud (VD), Suisse' },
              { label: 'Email', value: 'contact@smartkids-school.ch' },
              { label: tx('Téléphone / WhatsApp', 'Phone / WhatsApp', 'Telefon / WhatsApp'), value: '(+41) 077 476 84 92' },
              { label: 'Site web', value: 'www.smartkids-school.ch' },
              { label: tx('Activité principale', 'Main activity', 'Haupttätigkeit'), value: tx('Cours de programmation éducative en ligne pour enfants (6–15 ans)', 'Online educational programming courses for children (6–15 years)', 'Online-Bildungsprogrammierkurse für Kinder (6–15 Jahre)') },
            ].map((item, i) => (
              <div key={i}>
                <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.label}</p>
                <p className={darkMode ? 'text-gray-200' : 'text-gray-800'}>{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Responsable */}
        <Section darkMode={darkMode} iconEl={icons.user} title={tx('Responsable de la publication', 'Publication Manager', 'Verantwortlicher für den Inhalt')}>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            {tx(
              "Le responsable de la publication et du contenu éditorial de ce site est le propriétaire de Smart Kids School, joignable à l'adresse contact@smartkids-school.ch. En tant qu'entreprise individuelle, le propriétaire est personnellement responsable du contenu publié sur ce site.",
              "The publication and editorial content manager of this site is the owner of Smart Kids School, reachable at contact@smartkids-school.ch. As a sole proprietorship, the owner is personally responsible for all content published on this site.",
              "Der Verantwortliche für die Veröffentlichung und den redaktionellen Inhalt dieser Website ist der Inhaber von Smart Kids School, erreichbar unter contact@smartkids-school.ch."
            )}
          </p>
        </Section>

        {/* 3. Hébergement */}
        <Section darkMode={darkMode} iconEl={icons.server} title={tx('Hébergement', 'Hosting', 'Hosting')}>
          <div className={`space-y-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>{tx('Ce site est hébergé par :', 'This site is hosted by:', 'Diese Website wird gehostet von:')}</p>
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <p className="font-semibold">Netlify, Inc.</p>
              <p>512 2nd Street, Suite 200, San Francisco, CA 94107, USA</p>
              <a href="https://www.netlify.com/privacy" className="text-[#232999] hover:underline text-sm">netlify.com/privacy</a>
            </div>
            <p className="text-sm">
              {tx(
                "Les données des visiteurs peuvent être traitées sur des serveurs situés aux États-Unis et dans l'Union Européenne. Netlify est certifié conforme au RGPD et au DPF (Data Privacy Framework) UE–États-Unis.",
                "Visitor data may be processed on servers in the United States and the European Union. Netlify is certified compliant with GDPR and the EU–US Data Privacy Framework (DPF).",
                "Besucherdaten können auf Servern in den USA und der EU verarbeitet werden. Netlify ist DSGVO- und DPF-zertifiziert."
              )}
            </p>
          </div>
        </Section>

        {/* 4. Paiements */}
        <Section darkMode={darkMode} iconEl={icons.payment} title={tx('Paiements & sécurité financière', 'Payments & Financial Security', 'Zahlungen & Finanzsicherheit')}>
          <div className={`space-y-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>
              {tx(
                "Les paiements en ligne effectués sur ce site sont entièrement délégués à des prestataires de paiement certifiés PCI-DSS. Smart Kids School ne collecte, ne stocke ni ne traite directement aucune donnée de carte bancaire.",
                "Online payments made on this site are entirely delegated to PCI-DSS certified payment providers. Smart Kids School does not directly collect, store or process any bank card data.",
                "Online-Zahlungen auf dieser Website werden vollständig an PCI-DSS-zertifizierte Zahlungsanbieter delegiert. Smart Kids School erfasst, speichert oder verarbeitet keine Bankdaten direkt."
              )}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { name: 'Stripe, Inc.', detail: tx('354 Oyster Point Blvd, San Francisco, CA 94080, USA. Stripe est certifié PCI-DSS niveau 1, le plus haut standard de sécurité des paiements. Données transmises via TLS 1.2+.', '354 Oyster Point Blvd, San Francisco, CA 94080, USA. Stripe is PCI-DSS Level 1 certified, the highest payment security standard. Data transmitted via TLS 1.2+.', '354 Oyster Point Blvd, San Francisco, CA 94080, USA. Stripe ist PCI-DSS Level 1 zertifiziert. Daten werden über TLS 1.2+ übertragen.'), link: 'stripe.com/privacy' },
                { name: 'TWINT (via Stripe)', detail: tx("TWINT est un service de paiement mobile suisse. Les paiements TWINT via notre site transitent par Stripe, garantissant le même niveau de sécurité PCI-DSS.", "TWINT is a Swiss mobile payment service. TWINT payments via our site go through Stripe, guaranteeing the same PCI-DSS security level.", "TWINT ist ein Schweizer mobiler Zahlungsdienst. TWINT-Zahlungen laufen über Stripe mit gleichem PCI-DSS-Niveau."), link: 'twint.ch/en/privacy' },
              ].map((p, i) => (
                <div key={i} className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <p className="font-semibold text-sm mb-1">{p.name}</p>
                  <p className="text-xs">{p.detail}</p>
                  <a href={`https://${p.link}`} className="text-[#232999] hover:underline text-xs mt-1 inline-block">{p.link}</a>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* 5. Protection des données */}
        <Section darkMode={darkMode} iconEl={icons.lock} title={tx('Protection des données personnelles', 'Personal Data Protection', 'Datenschutz')}>
          <div className={`space-y-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <div>
              <h3 className={`font-bold mb-2 text-base ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{tx('Base légale', 'Legal basis', 'Rechtsgrundlage')}</h3>
              <p>{tx(
                "Le traitement de vos données personnelles est régi par la loi fédérale suisse sur la protection des données (nLPD, en vigueur depuis le 1er septembre 2023) et, dans la mesure applicable, par le Règlement Général sur la Protection des Données de l'UE (RGPD / GDPR).",
                "The processing of your personal data is governed by the Swiss Federal Act on Data Protection (nFADP, in force since 1 September 2023) and, where applicable, by the EU General Data Protection Regulation (GDPR).",
                "Die Verarbeitung Ihrer persönlichen Daten unterliegt dem Schweizer nDSG (in Kraft seit 1. September 2023) und, soweit anwendbar, der EU-DSGVO."
              )}</p>
            </div>

            <div>
              <h3 className={`font-bold mb-3 text-base ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{tx('Données collectées et finalités', 'Data collected and purposes', 'Erhobene Daten und Zwecke')}</h3>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className={`w-full text-sm ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <thead>
                    <tr className={darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-700'}>
                      <th className="px-4 py-3 text-left font-semibold">{tx('Donnée', 'Data', 'Daten')}</th>
                      <th className="px-4 py-3 text-left font-semibold">{tx('Finalité', 'Purpose', 'Zweck')}</th>
                      <th className="px-4 py-3 text-left font-semibold">{tx('Conservation', 'Retention', 'Aufbewahrung')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { data: tx('Nom, email, téléphone', 'Name, email, phone', 'Name, E-Mail, Telefon'), purpose: tx('Inscription, suivi et contact', 'Enrollment, follow-up and contact', 'Anmeldung, Nachverfolgung und Kontakt'), retention: tx('3 ans après la dernière interaction', '3 years after last interaction', '3 Jahre nach letzter Interaktion') },
                      { data: tx("Nom et âge de l'enfant", "Child's name and age", 'Name und Alter des Kindes'), purpose: tx('Adaptation pédagogique du cours', 'Pedagogical course adaptation', 'Pädagogische Kursanpassung'), retention: tx('Durée du cours + 1 an', 'Course duration + 1 year', 'Kursdauer + 1 Jahr') },
                      { data: tx('Données de paiement', 'Payment data', 'Zahlungsdaten'), purpose: tx('Traitement des transactions (Stripe)', 'Transaction processing (Stripe)', 'Transaktionsverarbeitung (Stripe)'), retention: tx('10 ans (obligation légale comptable)', '10 years (legal accounting)', '10 Jahre (gesetzliche Buchführung)') },
                      { data: tx('Adresse IP, logs', 'IP address, logs', 'IP-Adresse, Logs'), purpose: tx('Sécurité et diagnostic technique (Netlify)', 'Security and technical diagnostics (Netlify)', 'Sicherheit und Diagnose (Netlify)'), retention: tx('30 jours max', 'Max 30 days', 'Max. 30 Tage') },
                      { data: 'Cookies', purpose: tx('Fonctionnement, stats, marketing (avec consentement)', 'Functionality, stats, marketing (with consent)', 'Funktionalität, Stats, Marketing (mit Einwilligung)'), retention: tx('Session à 13 mois selon type', 'Session to 13 months depending on type', 'Sitzung bis 13 Monate je nach Typ') },
                    ].map((row, i) => (
                      <tr key={i} className={`border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <td className="px-4 py-3">{row.data}</td>
                        <td className="px-4 py-3">{row.purpose}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{row.retention}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className={`font-bold mb-3 text-base ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{tx('Vos droits', 'Your rights', 'Ihre Rechte')}</h3>
              <div className="grid md:grid-cols-2 gap-2">
                {[
                  { iconEl: icons.eye,    fr: 'Accès, consulter vos données',         en: 'Access, view your data',           de: 'Auskunft, Ihre Daten einsehen' },
                  { iconEl: icons.edit,   fr: 'Rectification, corriger vos données',  en: 'Rectification, correct your data', de: 'Berichtigung, Daten korrigieren' },
                  { iconEl: icons.trash,  fr: 'Suppression, effacer vos données',     en: 'Erasure, delete your data',        de: 'Löschung, Daten löschen' },
                  { iconEl: icons.export, fr: 'Portabilité, recevoir vos données',    en: 'Portability, receive your data',   de: 'Übertragbarkeit, Daten erhalten' },
                  { iconEl: icons.forbid, fr: 'Opposition, refuser certains traitements', en: 'Objection, refuse certain processing', de: 'Widerspruch, Verarbeitung ablehnen' },
                  { iconEl: icons.pause,  fr: "Limitation, restreindre l'utilisation", en: 'Restriction, limit processing',   de: 'Einschränkung, Verarbeitung begrenzen' },
                ].map((right, i) => (
                  <div key={i} className={`flex items-center gap-2 p-2.5 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'}`}>
                    <span className="text-[#232999] flex-shrink-0">{right.iconEl}</span>
                    <span className="text-sm">{tx(right.fr, right.en, right.de)}</span>
                  </div>
                ))}
              </div>
              <p className={`mt-3 text-sm p-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                <span className="inline-flex items-center gap-1"><span className="text-[#232999]">{icons.mail}</span>
                {tx(
                  " Pour exercer ces droits, adressez un email à contact@smartkids-school.ch. Réponse garantie dans un délai de 30 jours conformément à la nLPD.",
                  " To exercise these rights, send an email to contact@smartkids-school.ch. Response guaranteed within 30 days in accordance with nFADP.",
                  " Um diese Rechte auszuüben, senden Sie eine E-Mail an contact@smartkids-school.ch. Antwort innerhalb von 30 Tagen gemäß nDSG."
                )}</span>
              </p>
            </div>

            <div>
              <h3 className={`font-bold mb-2 text-base ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{tx('Partage des données avec des tiers', 'Data sharing with third parties', 'Datenweitergabe an Dritte')}</h3>
              <p>{tx(
                "Smart Kids School ne vend ni ne loue vos données personnelles. Vos données peuvent être partagées uniquement avec : les prestataires de paiement (Stripe/TWINT), l'hébergeur (Netlify), les outils de visioconférence utilisés pour les cours (ex. Zoom/Teams), et uniquement si requis par la loi suisse.",
                "Smart Kids School does not sell or rent your personal data. Data may be shared only with: payment providers (Stripe/TWINT), the host (Netlify), video conferencing tools for courses (e.g. Zoom/Teams), and only if required by Swiss law.",
                "Smart Kids School verkauft oder vermietet Ihre Daten nicht. Daten können nur mit Zahlungsanbietern (Stripe/TWINT), Netlify, Videokonferenz-Tools und bei gesetzlicher Pflicht geteilt werden."
              )}</p>
            </div>
          </div>
        </Section>

        {/* 6. Cookies */}
        <Section darkMode={darkMode} iconEl={icons.shield} title={tx('Politique de cookies', 'Cookie Policy', 'Cookie-Richtlinie')}>
          <div className={`space-y-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>{tx(
              "Ce site utilise des cookies, de petits fichiers texte stockés sur votre appareil, pour assurer son bon fonctionnement et améliorer votre expérience de navigation.",
              "This site uses cookies, small text files stored on your device, to ensure proper functioning and improve your browsing experience.",
              "Diese Website verwendet Cookies, kleine Textdateien, um die Funktionalität sicherzustellen und Ihre Browsererfahrung zu verbessern."
            )}</p>
            <div className="space-y-2">
              {[
                { emoji: '🔒', type: tx('Fonctionnels (obligatoires)', 'Functional (required)', 'Funktional (erforderlich)'), desc: tx("Essentiels au bon fonctionnement du site. Ne peuvent pas être désactivés.", "Essential for the website to function properly. Cannot be disabled.", "Wesentlich für die ordnungsgemäße Funktion. Können nicht deaktiviert werden.") },
                { emoji: '⚙️', type: tx('Préférences', 'Preferences', 'Präferenzen'), desc: tx("Mémorisent vos préférences (langue, mode sombre). Durée : jusqu'à 1 an.", "Remember your preferences (language, dark mode). Duration: up to 1 year.", "Speichern Ihre Einstellungen (Sprache, Dunkelmodus). Dauer: bis zu 1 Jahr.") },
                { emoji: '📊', type: tx('Statistiques', 'Statistics', 'Statistiken'), desc: tx("Analysent l'utilisation du site pour améliorer le contenu. Données anonymisées.", "Analyze site usage to improve content. Anonymized data.", "Analysieren die Website-Nutzung. Anonymisierte Daten.") },
                { emoji: '📢', type: tx('Marketing', 'Marketing', 'Marketing'), desc: tx("Permettent la personnalisation publicitaire sur des plateformes tierces. Consentement requis.", "Allow advertising personalization on third-party platforms. Consent required.", "Ermöglichen Werbe-Personalisierung auf Drittanbieter-Plattformen. Einwilligung erforderlich.") },
              ].map((c, i) => (
                <div key={i} className={`p-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <p className="font-semibold text-sm">{c.emoji} {c.type}</p>
                  <p className="text-xs mt-1">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* 7. Services tiers */}
        <Section darkMode={darkMode} iconEl={icons.link} title={tx('Services tiers intégrés', 'Integrated Third-Party Services', 'Integrierte Drittanbieter-Dienste')}>
          <div className={`space-y-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { name: 'Vimeo', purpose: tx('Vidéos pédagogiques intégrées', 'Integrated educational videos', 'Integrierte Lehrvideos'), link: 'vimeo.com/privacy' },
                { name: 'Netlify Forms', purpose: tx("Gestion des formulaires d'inscription et de contact", 'Enrollment and contact form management', 'Formularverwaltung'), link: 'netlify.com/privacy' },
                { name: 'Stripe', purpose: tx('Traitement des paiements sécurisés', 'Secure payment processing', 'Sichere Zahlungsverarbeitung'), link: 'stripe.com/privacy' },
                { name: 'TWINT', purpose: tx('Paiement mobile suisse (via Stripe)', 'Swiss mobile payment (via Stripe)', 'Schweizer Mobilzahlung (via Stripe)'), link: 'twint.ch/en/privacy' },
                { name: 'WhatsApp (Meta)', purpose: tx('Lien de contact téléphonique', 'Phone contact link', 'Telefonischer Kontaktlink'), link: 'whatsapp.com/legal/privacy-policy' },
                { name: 'Google Fonts / Remix Icons', purpose: tx('Polices et icônes (CDN)', 'Fonts and icons (CDN)', 'Schriften und Icons (CDN)'), link: 'policies.google.com/privacy' },
              ].map((s, i) => (
                <div key={i} className={`flex items-start justify-between gap-3 p-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div>
                    <p className="font-semibold text-sm">{s.name}</p>
                    <p className="text-xs mt-0.5">{s.purpose}</p>
                  </div>
                  <a href={`https://${s.link}`} target="_blank" rel="noopener noreferrer" className="text-[#232999] text-xs hover:underline ml-2 whitespace-nowrap flex-shrink-0">{tx('Politique', 'Policy', 'Richtlinie')}</a>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* 8. Propriété intellectuelle */}
        <Section darkMode={darkMode} iconEl={icons.copyright} title={tx('Propriété intellectuelle', 'Intellectual Property', 'Geistiges Eigentum')}>
          <div className={`space-y-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>{tx(
              "L'ensemble du contenu de ce site, textes, images, logos, vidéos, programmes pédagogiques, est la propriété exclusive de Smart Kids School et est protégé par le droit suisse de la propriété intellectuelle (Loi sur le droit d'auteur, RS 231.1).",
              "All content on this site, texts, images, logos, videos, educational programs, is the exclusive property of Smart Kids School and is protected by Swiss intellectual property law.",
              "Alle Inhalte dieser Website sind ausschließliches Eigentum von Smart Kids School und durch das Schweizer Urheberrecht geschützt."
            )}</p>
            <p className="text-sm">{tx(
              'Le nom "Smart Kids School", le logo SKS et les dénominations de cours constituent des signes distinctifs protégés. Scratch® est une marque déposée du Massachusetts Institute of Technology (MIT), utilisée à des fins éducatives.',
              'The name "Smart Kids School", the SKS logo and course names are protected distinctive signs. Scratch® is a registered trademark of the MIT, used for educational purposes.',
              'Der Name "Smart Kids School", das SKS-Logo und alle Kursnamen sind geschützte Unterscheidungszeichen. Scratch® ist eine eingetragene Marke des MIT.'
            )}</p>
          </div>
        </Section>

        {/* 9. Limitation de responsabilité */}
        <Section darkMode={darkMode} iconEl={icons.info} title={tx('Limitation de responsabilité', 'Limitation of Liability', 'Haftungsbeschränkung')}>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            {tx(
              "Smart Kids School s'efforce de maintenir les informations de ce site à jour et exactes. Toutefois, nous ne saurions être engagés en cas d'interruption temporaire du service, d'erreurs techniques, ou de contenus de sites tiers accessibles via des liens hypertextes.",
              "Smart Kids School strives to keep all information on this site up to date and accurate. However, our liability cannot be engaged in case of temporary service interruption, technical errors, or third-party site content accessible via hyperlinks.",
              "Smart Kids School ist bestrebt, alle Informationen aktuell und korrekt zu halten, haftet jedoch nicht für vorübergehende Unterbrechungen oder technische Fehler."
            )}
          </p>
        </Section>

        {/* 10. Droit applicable */}
        <Section darkMode={darkMode} iconEl={icons.scales} title={tx('Droit applicable & for juridique', 'Applicable Law & Jurisdiction', 'Anwendbares Recht & Gerichtsstand')}>
          <div className={`space-y-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>{tx(
              "Le présent site et ces mentions légales sont régis par le droit suisse. Pour tout litige, les tribunaux de l'arrondissement de Lausanne (Vaud, Suisse) sont seuls compétents.",
              "This site and this legal notice are governed by Swiss law. For any dispute, the courts of the district of Lausanne (Vaud, Switzerland) have sole jurisdiction.",
              "Diese Website unterliegt dem Schweizer Recht. Für Streitigkeiten sind die Gerichte des Bezirks Lausanne (Waadt, Schweiz) ausschließlich zuständig."
            )}</p>
            <div className={`flex items-start gap-3 p-4 rounded-xl border ${darkMode ? 'bg-indigo-900/30 border-indigo-700' : 'bg-indigo-50 border-indigo-200'}`}>
              <span className="text-[#232999] flex-shrink-0 mt-0.5">{icons.headphones}</span>
              <p className="text-sm">{tx(
                "Pour toute réclamation, contactez-nous d'abord à contact@smartkids-school.ch afin de trouver une solution amiable avant toute procédure judiciaire.",
                "For any complaint, please first contact us at contact@smartkids-school.ch to find an amicable solution before any legal proceedings.",
                "Bei Beschwerden empfehlen wir zunächst die direkte Kontaktaufnahme unter contact@smartkids-school.ch."
              )}</p>
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
