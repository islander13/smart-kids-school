import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import CookieBanner from '../components/CookieBanner';
import { parseLocaleFromPath, localizedPath, type Locale } from '../i18n/routing';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import AuthPanel from '../components/espace/AuthPanel';
import ResetPasswordForm from '../components/espace/ResetPasswordForm';
import VideoSectionBlock from '../components/espace/VideoSectionBlock';
import VideoPlayer from '../components/espace/VideoPlayer';
import RoleSelector from '../components/espace/RoleSelector';
import RoleSwitcher from '../components/espace/RoleSwitcher';
import ContinueBanner from '../components/espace/ContinueBanner';
import ParentDashboard from '../components/espace/ParentDashboard';
import NextSessionCard from '../components/espace/NextSessionCard';
import MyLinkCode from '../components/espace/MyLinkCode';
import MyCertificates from '../components/espace/MyCertificates';
import SubscriptionEndedNotice from '../components/espace/SubscriptionEndedNotice';
import { ESPACE_SECTIONS, type EspaceVideo } from '../data/espaceContent';
import { getNextUnwatchedVideo, hasAnyPublishedVideo, isVideoWatched } from '../utils/progress';

type Lang = Locale;

const T: Record<Lang, {
  nav: { home: string; tarifs: string; premium: string; stages: string; blog: string; espace: string };
  pageTitle: string;
  welcomeBack: string;
  logout: string;
  loggingOut: string;
  confirming: string;
  confirmError: string;
  backToLogin: string;
  introTitle: string;
  introDesc: string;
}> = {
  FR: {
    nav: { home: 'Accueil', tarifs: 'Tarifs', premium: 'Premium', stages: 'Stages', blog: 'Blog', espace: 'Mon espace' },
    pageTitle: 'Mon espace',
    welcomeBack: 'Content de vous revoir !',
    logout: 'Se déconnecter',
    loggingOut: 'Déconnexion…',
    confirming: 'Confirmation de votre compte…',
    confirmError: "Ce lien de confirmation n'est plus valide. Essayez de vous connecter directement.",
    backToLogin: '← Retour à la connexion',
    introTitle: 'Ce que contient Mon espace',
    introDesc: "L'espace personnel de votre enfant pour continuer à apprendre entre deux cours.",
  },
  EN: {
    nav: { home: 'Home', tarifs: 'Pricing', premium: 'Premium', stages: 'Camps', blog: 'Blog', espace: 'My space' },
    pageTitle: 'My space',
    welcomeBack: 'Welcome back!',
    logout: 'Log out',
    loggingOut: 'Logging out…',
    confirming: 'Confirming your account…',
    confirmError: 'This confirmation link is no longer valid. Try logging in directly.',
    backToLogin: '← Back to login',
    introTitle: "What's inside My space",
    introDesc: "Your child's personal space to keep learning between lessons.",
  },
  DE: {
    nav: { home: 'Startseite', tarifs: 'Preise', premium: 'Premium', stages: 'Camps', blog: 'Blog', espace: 'Mein Bereich' },
    pageTitle: 'Mein Bereich',
    welcomeBack: 'Schön, Sie wiederzusehen!',
    logout: 'Abmelden',
    loggingOut: 'Abmeldung…',
    confirming: 'Ihr Konto wird bestätigt…',
    confirmError: 'Dieser Bestätigungslink ist nicht mehr gültig. Versuchen Sie sich direkt anzumelden.',
    backToLogin: '← Zurück zur Anmeldung',
    introTitle: 'Was Mein Bereich enthält',
    introDesc: 'Der persönliche Bereich Ihres Kindes, um zwischen den Kursen weiterzulernen.',
  },
};

// Wrapper : AuthProvider (et donc gotrue-js) n'est chargé que si on visite
// /espace, pas sur le reste du site.
export default function Espace() {
  return (
    <AuthProvider>
      <EspaceContent />
    </AuthProvider>
  );
}

function EspaceContent() {
  const [currentLang, setCurrentLang] = useState<Lang>(() => parseLocaleFromPath(window.location.pathname).locale);
  const navigate = useNavigate();
  const lp = (path: string) => localizedPath(path, currentLang);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try { return localStorage.getItem('sks_theme') === 'dark'; } catch { return false; }
  });
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<EspaceVideo | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const { user, loading, logOut, confirmSignup, role, progress, toggleVideoWatched } = useAuth();

  // Liens envoyés par Netlify Identity par email : #recovery_token=... pour
  // "mot de passe oublié", #confirmation_token=... pour confirmer un compte
  // après inscription (si autoconfirm est désactivé côté Identity).
  const [tokens] = useState(() => {
    const hash = window.location.hash;
    const recovery = hash.match(/recovery_token=([^&]+)/);
    const confirmation = hash.match(/confirmation_token=([^&]+)/);
    const invite = hash.match(/invite_token=([^&]+)/);
    return {
      recoveryToken: recovery ? decodeURIComponent(recovery[1]) : null,
      confirmationToken: confirmation ? decodeURIComponent(confirmation[1]) : null,
      inviteToken: invite ? decodeURIComponent(invite[1]) : null,
    };
  });
  const [confirming, setConfirming] = useState(!!tokens.confirmationToken);
  const [confirmError, setConfirmError] = useState(false);

  useEffect(() => {
    if (!tokens.confirmationToken) return;
    confirmSignup(tokens.confirmationToken)
      .then(() => { window.history.replaceState(null, '', window.location.pathname); })
      .catch(() => setConfirmError(true))
      .finally(() => setConfirming(false));
    // Ne doit s'exécuter qu'une fois, au montage : le token vient de l'URL initiale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sks_lang', currentLang);
      localStorage.setItem('sks_theme', darkMode ? 'dark' : 'light');
    } catch {}
    document.documentElement.classList.toggle('dark', darkMode);
  }, [currentLang, darkMode]);

  // SEO : page privée, jamais indexée, pas de hreflang (setHreflangTags
  // n'est volontairement pas appelé ici — /espace n'existe pas dans
  // BASE_PATHS/sitemap.xml, voir src/router/config.tsx).
  useEffect(() => {
    document.documentElement.lang = { FR: 'fr', EN: 'en', DE: 'de' }[currentLang];
    document.title = `${T[currentLang].pageTitle} | Smart Kids School`;
    let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = 'noindex, nofollow';
    return () => { if (robots) robots.content = 'index, follow'; };
  }, [currentLang]);

  const t = T[currentLang];
  const nextVideo = getNextUnwatchedVideo(ESPACE_SECTIONS, progress);
  // Coupé par stripe-webhook.js à la résiliation d'un abonnement récurrent
  // (voir SubscriptionEndedNotice) — absent/undefined vaut actif, pour ne
  // jamais bloquer un compte existant créé avant l'ajout de ce champ ou un
  // compte lié à un paiement unique (jamais concerné par cet indicateur).
  const subscriptionActive = user?.app_metadata?.subscriptionActive !== false;

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await logOut(); } finally { setLoggingOut(false); }
  };

  return (
    <div className={`min-h-screen font-['Inter',sans-serif] transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
      {/* ── Navigation ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm shadow-sm transition-colors duration-300 ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center gap-3">
              <a href={lp('/')}><img src="/Logo_official_dark.png" alt="Smart Kids School" width="192" height="64" className="h-16 w-auto" /></a>
              <img src="/flag-ch.png" alt="Drapeau de la Suisse" width="24" height="24" className="h-6 w-auto flex-shrink-0 shadow-sm rounded-sm" />
            </div>
            <div className="hidden md:flex items-center gap-8 ml-8">
              <a href={lp('/')} className={`text-sm font-medium transition-colors whitespace-nowrap ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.nav.home}</a>
              <a href={lp('/tarifs')} className={`text-sm font-medium transition-colors whitespace-nowrap ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.nav.tarifs}</a>
              <a href={lp('/stages')} className={`text-sm font-medium transition-colors whitespace-nowrap ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.nav.stages}</a>
              <a href={lp('/espace')} className={darkMode ? 'text-sm font-semibold text-indigo-400 whitespace-nowrap' : 'text-sm font-semibold text-[#232999] whitespace-nowrap'}>{t.nav.espace}</a>
            </div>
            <div className="hidden md:flex items-center gap-3 ml-6">
              <button onClick={() => setDarkMode(!darkMode)} aria-label="Toggle theme" className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-300 cursor-pointer ${darkMode ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-100 border-gray-200 text-gray-700 hover:border-indigo-400'}`}>
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
                      <button key={lang} onClick={() => { setCurrentLang(lang); setShowLangDropdown(false); navigate(localizedPath('/espace', lang)); }} className={`w-full px-4 py-2.5 text-sm text-left transition-colors cursor-pointer ${currentLang === lang ? 'bg-[#232999] text-white font-semibold' : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-indigo-50'}`}>
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {user && (
                <button onClick={handleLogout} disabled={loggingOut} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer disabled:opacity-60 ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                  {loggingOut ? t.loggingOut : t.logout}
                </button>
              )}
            </div>
            <div className="md:hidden flex items-center gap-2">
              <button onClick={() => setDarkMode(!darkMode)} aria-label="Toggle theme" className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 cursor-pointer ${darkMode ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-100 border-gray-200 text-gray-700'}`}>
                {darkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu" className={`p-2 rounded-lg transition-colors cursor-pointer ${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}>
                <i className={`ri-${mobileMenuOpen ? 'close' : 'menu'}-line text-2xl`}></i>
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className={`md:hidden border-t ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="px-4 py-4 space-y-3">
              <a href={lp('/')} onClick={() => setMobileMenuOpen(false)} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.nav.home}</a>
              <a href={lp('/tarifs')} onClick={() => setMobileMenuOpen(false)} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.nav.tarifs}</a>
              <a href={lp('/stages')} onClick={() => setMobileMenuOpen(false)} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.nav.stages}</a>
              <a href={lp('/espace')} onClick={() => setMobileMenuOpen(false)} className={darkMode ? 'block text-sm font-semibold py-2 text-indigo-400' : 'block text-sm font-semibold py-2 text-[#232999]'}>{t.nav.espace}</a>
              <div className="flex gap-2 py-2">
                {(['FR', 'EN', 'DE'] as Lang[]).map(lang => (
                  <button key={lang} onClick={() => { setCurrentLang(lang); navigate(localizedPath('/espace', lang)); setMobileMenuOpen(false); }} className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${currentLang === lang ? 'bg-[#232999] text-white' : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{lang}</button>
                ))}
              </div>
              {user && (
                <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} disabled={loggingOut} className={`w-full text-left text-sm font-semibold py-2 cursor-pointer disabled:opacity-60 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {loggingOut ? t.loggingOut : t.logout}
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── Contenu ── */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {loading || confirming ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-10 h-10 border-4 border-[#232999] border-t-transparent rounded-full animate-spin"></div>
              {confirming && <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.confirming}</p>}
            </div>
          ) : confirmError ? (
            <div className="max-w-md mx-auto text-center">
              <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <i className="ri-error-warning-line mr-1"></i>{t.confirmError}
              </div>
              <button type="button" onClick={() => setConfirmError(false)} className={`text-sm font-medium hover:underline cursor-pointer ${darkMode ? 'text-indigo-400' : 'text-[#232999]'}`}>
                {t.backToLogin}
              </button>
            </div>
          ) : tokens.recoveryToken ? (
            <div className={`max-w-md mx-auto rounded-3xl border-2 p-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-lg'}`}>
              <ResetPasswordForm darkMode={darkMode} currentLang={currentLang} token={tokens.recoveryToken} mode="recovery" />
            </div>
          ) : tokens.inviteToken ? (
            <div className={`max-w-md mx-auto rounded-3xl border-2 p-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-lg'}`}>
              <ResetPasswordForm darkMode={darkMode} currentLang={currentLang} token={tokens.inviteToken} mode="invite" />
            </div>
          ) : user && !subscriptionActive ? (
            <SubscriptionEndedNotice darkMode={darkMode} currentLang={currentLang} onLogout={handleLogout} />
          ) : user && !role ? (
            <RoleSelector darkMode={darkMode} currentLang={currentLang} />
          ) : user && role === 'parent' ? (
            <ParentDashboard darkMode={darkMode} currentLang={currentLang} />
          ) : user ? (
            <>
              <div className="flex items-start justify-between gap-4 flex-wrap mb-10">
                <div>
                  <h1 className={`text-3xl lg:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.pageTitle}</h1>
                  <p className={`text-base mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.welcomeBack}</p>
                </div>
                {role && <RoleSwitcher currentRole={role} darkMode={darkMode} currentLang={currentLang} />}
              </div>
              <NextSessionCard darkMode={darkMode} currentLang={currentLang} />
              <MyLinkCode darkMode={darkMode} currentLang={currentLang} />
              <MyCertificates darkMode={darkMode} currentLang={currentLang} />
              {hasAnyPublishedVideo(ESPACE_SECTIONS) && (
                <ContinueBanner next={nextVideo} darkMode={darkMode} currentLang={currentLang} onPlay={setPlayingVideo} />
              )}
              {ESPACE_SECTIONS.map(section => (
                <VideoSectionBlock
                  key={section.key}
                  section={section}
                  darkMode={darkMode}
                  currentLang={currentLang}
                  progress={progress}
                  defaultExpanded={nextVideo?.section.key === section.key}
                  onPlay={setPlayingVideo}
                  onToggleWatched={toggleVideoWatched}
                />
              ))}
            </>
          ) : (
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start max-w-5xl mx-auto">
              <div className="lg:pt-4">
                <h1 className={`text-2xl lg:text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.introTitle}</h1>
                <p className={`text-base mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.introDesc}</p>
                <div className="space-y-5">
                  {[
                    { icon: 'ri-play-circle-line', t: { FR: 'Cours en replay', EN: 'Lesson replays', DE: 'Kursaufzeichnungen' }, d: { FR: 'Chaque vidéo reste disponible pour revoir une notion à tout moment', EN: 'Every video stays available to revisit a concept anytime', DE: 'Jedes Video bleibt verfügbar, um einen Begriff jederzeit zu wiederholen' } },
                    { icon: 'ri-questionnaire-line', t: { FR: 'Quiz de validation', EN: 'Validation quizzes', DE: 'Verständnis-Quiz' }, d: { FR: 'Un quiz court à la fin de chaque section pour vérifier ce qui est acquis', EN: 'A short quiz at the end of each section to check what has been learned', DE: 'Ein kurzes Quiz am Ende jedes Abschnitts, um das Gelernte zu prüfen' } },
                    { icon: 'ri-medal-line', d: { FR: 'Chaque étape franchie débloque un badge, visible par toute la famille', EN: 'Every milestone unlocks a badge, visible to the whole family', DE: 'Jeder Meilenstein schaltet ein Abzeichen frei, für die ganze Familie sichtbar' }, t: { FR: 'Badges & progression', EN: 'Badges & progress', DE: 'Abzeichen & Fortschritt' } },
                    { icon: 'ri-download-2-line', t: { FR: 'Ressources à télécharger', EN: 'Downloadable resources', DE: 'Herunterladbare Ressourcen' }, d: { FR: 'Fiches, exercices et projets pratiques, pour pratiquer hors ligne', EN: 'Worksheets, exercises and hands-on projects, to practise offline', DE: 'Arbeitsblätter, Übungen und praktische Projekte zum Offline-Üben' } },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-indigo-900/40' : 'bg-indigo-100'}`}>
                        <i className={`${item.icon} text-lg ${darkMode ? 'text-indigo-300' : 'text-[#232999]'}`}></i>
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.t[currentLang]}</p>
                        <p className={`text-xs mt-0.5 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.d[currentLang]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <AuthPanel darkMode={darkMode} currentLang={currentLang} />
            </div>
          )}
        </div>
      </section>

      {playingVideo && (
        <VideoPlayer
          video={playingVideo}
          currentLang={currentLang}
          watched={isVideoWatched(progress, playingVideo.id)}
          onToggleWatched={() => toggleVideoWatched(playingVideo.id)}
          onClose={() => setPlayingVideo(null)}
        />
      )}

      <Footer currentLang={currentLang} darkMode={darkMode} />
      <CookieBanner currentLang={currentLang} darkMode={darkMode} />
    </div>
  );
}
