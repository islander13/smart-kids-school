import { useState, useEffect } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import CookieBanner from '../../components/CookieBanner';
import { parseLocaleFromPath, localizedPath, setHreflangTags, type Locale } from '../../i18n/routing';
import { useEmbeddedCheckout } from '../../lib/useEmbeddedCheckout';
import { getShopProduct } from '../../lib/shopCatalog';

// ─────────────────────────────────────────────────────────────────────────
// Page produit boutique — PAS ENCORE BRANCHÉE au routeur. Reprend le même
// mécanisme de paiement intégré que tarifs/stages/premium (useEmbeddedCheckout
// + Stripe embedded checkout), mais appelle create-shop-checkout-session.js
// (paiement unique, sans données enfant/parent) plutôt que
// create-checkout-session.js.
// ─────────────────────────────────────────────────────────────────────────

type Lang = Locale;

const T: Record<Lang, {
  buy: string;
  emailLabel: string;
  submit: string;
  secure: string;
  submitError: string;
  loadingPayment: string;
  navHome: string; navProgramme: string; navTarifs: string; navStages: string; navFaq: string; navBlog: string; navShop: string; navEnroll: string;
}> = {
  FR: {
    buy: 'Acheter',
    emailLabel: 'Votre email',
    submit: 'Procéder au paiement sécurisé',
    secure: 'Paiement sécurisé via Stripe · Livraison immédiate après paiement',
    submitError: 'Une erreur est survenue. Merci de nous écrire à contact@smartkids-school.ch',
    loadingPayment: 'Chargement du paiement sécurisé…',
    navHome: 'Accueil', navProgramme: 'Programme', navTarifs: 'Tarifs', navStages: 'Stages', navFaq: 'FAQ', navBlog: 'Blog', navShop: 'Boutique', navEnroll: 'Inscrire mon enfant',
  },
  EN: {
    buy: 'Buy',
    emailLabel: 'Your email',
    submit: 'Proceed to secure payment',
    secure: 'Secure payment via Stripe · Instant delivery after payment',
    submitError: 'An error occurred. Please write to us at contact@smartkids-school.ch',
    loadingPayment: 'Loading secure payment…',
    navHome: 'Home', navProgramme: 'Programme', navTarifs: 'Pricing', navStages: 'Camps', navFaq: 'FAQ', navBlog: 'Blog', navShop: 'Shop', navEnroll: 'Enroll my child',
  },
  DE: {
    buy: 'Kaufen',
    emailLabel: 'Ihre E-Mail',
    submit: 'Zur sicheren Zahlung',
    secure: 'Sichere Zahlung über Stripe · Sofortige Lieferung nach Zahlung',
    submitError: 'Ein Fehler ist aufgetreten. Bitte schreiben Sie uns an contact@smartkids-school.ch',
    loadingPayment: 'Sichere Zahlung wird geladen…',
    navHome: 'Startseite', navProgramme: 'Programm', navTarifs: 'Preise', navStages: 'Camps', navFaq: 'FAQ', navBlog: 'Blog', navShop: 'Shop', navEnroll: 'Kind anmelden',
  },
};

export default function ShopProduct() {
  const [currentLang, setCurrentLang] = useState<Lang>(() => parseLocaleFromPath(window.location.pathname).locale);
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const lp = (path: string) => localizedPath(path, currentLang);
  const [darkMode, setDarkMode] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<'' | 'embedded' | 'error'>('');

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
  const product = slug ? getShopProduct(slug) : undefined;
  const checkout = useEmbeddedCheckout();

  useEffect(() => {
    if (!product) return;
    document.title = `${product.title[currentLang]} | Smart Kids School`;
    setHreflangTags(`/shop/${product.slug}`, currentLang);
  }, [product, currentLang]);

  const openModal = () => {
    setSubmitMessage('');
    checkout.reset();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSubmitMessage('');
    checkout.reset();
  };

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape' && showModal) closeModal(); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [showModal]);

  useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product) return;
    setSubmitting(true);
    setSubmitMessage('');
    try {
      const res = await fetch('/.netlify/functions/create-shop-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productKey: product.slug, customerEmail: email }),
      });
      if (!res.ok) {
        console.error('Checkout error:', await res.json().catch(() => null));
        setSubmitMessage('error');
        return;
      }
      const { clientSecret } = await res.json();
      if (!clientSecret) {
        setSubmitMessage('error');
        return;
      }
      checkout.start(clientSecret);
      setSubmitMessage('embedded');
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitMessage('error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!slug || !product) {
    return <Navigate to={lp('/shop')} replace />;
  }

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
              <a href={lp('/shop')} className="text-sm font-semibold text-[#232999]">{t.navShop}</a>
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
                      <button key={lang} onClick={() => { setCurrentLang(lang); setShowLangDropdown(false); navigate(localizedPath(`/shop/${slug}`, lang)); }} className={`w-full px-4 py-2.5 text-sm text-left transition-colors cursor-pointer ${currentLang === lang ? 'bg-[#232999] text-white font-semibold' : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-indigo-50'}`}>
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
              <a href={lp('/shop')} className="block text-sm font-semibold py-2 text-[#232999]">{t.navShop}</a>
              <div className="flex gap-2 py-2">
                {(['FR', 'EN', 'DE'] as Lang[]).map(lang => (
                  <button key={lang} onClick={() => { setCurrentLang(lang); navigate(localizedPath(`/shop/${slug}`, lang)); }} className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${currentLang === lang ? 'bg-[#232999] text-white' : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{lang}</button>
                ))}
              </div>
              <a href={lp('/tarifs')} className="block w-full bg-[#232999] text-white px-6 py-3 rounded-full text-sm font-semibold text-center">{t.navEnroll}</a>
            </div>
          </div>
        )}
      </nav>

      {/* ── Produit ── */}
      <section className={`pt-32 pb-20 px-4 ${darkMode ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="max-w-3xl mx-auto">
          <a href={lp('/shop')} className={`text-sm font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-[#232999] hover:text-indigo-700'}`}>
            {currentLang === 'FR' ? '← Retour à la boutique' : currentLang === 'EN' ? '← Back to shop' : '← Zurück zum Shop'}
          </a>

          <div className="mt-6 grid md:grid-cols-[200px_1fr] gap-8 items-start">
            <div className={`aspect-[3/4] rounded-2xl flex items-center justify-center text-7xl ${darkMode ? 'bg-gray-800' : 'bg-indigo-50'}`}>
              {product.emoji}
            </div>
            <div>
              <h1 className={`text-3xl lg:text-4xl font-bold leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.title[currentLang]}</h1>
              <p className={`text-lg mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{product.tagline[currentLang]}</p>
              <p className={`text-3xl font-black mt-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.priceCHF} CHF</p>
              <button onClick={openModal} className="mt-6 bg-[#232999] hover:bg-[#1a1f7a] text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer">
                {t.buy}
              </button>
            </div>
          </div>

          <div className={`mt-12 pt-8 border-t leading-relaxed ${darkMode ? 'border-gray-800 text-gray-300' : 'border-gray-200 text-gray-700'}`}>
            {product.description[currentLang]}
          </div>
        </div>
      </section>

      {/* ── Modal d'achat ── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm p-4 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className={`relative w-full max-w-lg mx-auto my-8 rounded-3xl shadow-2xl ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`}>
            <button onClick={closeModal} aria-label="Close modal" className={`absolute top-4 right-4 p-2 rounded-full z-10 cursor-pointer ${darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}>
              <i className="ri-close-line text-2xl"></i>
            </button>

            {submitMessage === 'embedded' ? (
              <div className="p-4 sm:p-8">
                {!checkout.isReady && (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-10 h-10 border-4 border-[#232999] border-t-transparent rounded-full animate-spin"></div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.loadingPayment}</p>
                  </div>
                )}
                <div ref={checkout.containerRef} className={checkout.isReady ? '' : 'invisible h-0 overflow-hidden'} />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8">
                <div className="mb-6">
                  <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.title[currentLang]}</h3>
                  <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-[#232999]'}`}>{product.priceCHF} CHF</p>
                </div>

                <div className="mb-6">
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.emailLabel} *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={`w-full px-4 py-3 rounded-xl border focus:border-[#232999] focus:ring-2 focus:ring-indigo-200 outline-none text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`} />
                </div>

                {submitMessage === 'error' && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    <i className="ri-error-warning-line mr-1"></i>{t.submitError}
                  </div>
                )}

                <button type="submit" disabled={submitting} className="w-full bg-[#232999] hover:bg-[#1a1f7a] disabled:opacity-60 text-white px-6 py-4 rounded-full font-bold hover:shadow-lg transition-all cursor-pointer">
                  {t.submit}
                </button>
                <p className={`text-xs text-center mt-3 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{t.secure}</p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <Footer currentLang={currentLang} darkMode={darkMode} />
      <CookieBanner currentLang={currentLang} darkMode={darkMode} />
    </div>
  );
}
