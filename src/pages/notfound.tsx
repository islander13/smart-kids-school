import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { parseLocaleFromPath, localizedPath } from "../i18n/routing";

export default function NotFound() {
  const location = useLocation();
  const { locale } = parseLocaleFromPath(location.pathname);
  const lp = (path: string) => localizedPath(path, locale);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try { return localStorage.getItem('sks_theme') === 'dark'; } catch { return false; }
  });

  useEffect(() => {
    const sync = () => {
      if (document.visibilityState === 'visible') {
        try { setDarkMode(localStorage.getItem('sks_theme') === 'dark'); } catch {}
      }
    };
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('pageshow', sync);
    return () => {
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('pageshow', sync);
    };
  }, []);

  return (
    <div className={`min-h-screen flex flex-col font-['Inter',sans-serif] ${darkMode ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
      <nav className={`px-6 py-4 flex items-center justify-between border-b ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <a href={lp('/')}>
            <img src="Logo_official_dark.png" alt="Smart Kids School" width="144" height="48" className="h-12 w-auto" />
          </a>
          <img src="flag-ch.png" alt="Drapeau de la Suisse" width="24" height="24" className="h-6 w-auto flex-shrink-0 shadow-sm rounded-sm" />
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href={lp('/')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>Accueil</a>
          <a href={lp('/tarifs')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>Tarifs</a>
          <a href={lp('/stages')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>Stages</a>
          <a href={lp('/faq')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>FAQ</a>
        </div>
      </nav>
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
        <div className={`absolute text-[12rem] sm:text-[20rem] font-black select-none pointer-events-none leading-none ${darkMode ? 'text-gray-800' : 'text-gray-50'}`}>404</div>
        <div className="relative z-10 max-w-lg">
          <div className="w-20 h-20 bg-gradient-to-br from-[#232999] to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <h1 className={`text-3xl sm:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Page introuvable</h1>
          <p className={`text-base sm:text-lg mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cette page n'existe pas ou a été déplacée.</p>
          <code className={`text-xs sm:text-sm px-3 py-1 rounded-lg inline-block mb-8 break-all ${darkMode ? 'bg-gray-800 text-indigo-400' : 'bg-indigo-50 text-indigo-700'}`}>{location.pathname}</code>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={lp('/')} className="bg-[#232999] hover:bg-[#1a1f7a] text-white px-8 py-3 rounded-full font-semibold transition-all hover:shadow-lg">← Retour à l'accueil</a>
            <a href={lp('/tarifs')} className={`px-8 py-3 rounded-full font-semibold border-2 transition-all ${darkMode ? 'border-gray-600 text-gray-300 hover:border-indigo-400' : 'border-gray-200 text-gray-700 hover:border-[#232999]'}`}>Voir nos tarifs</a>
          </div>
        </div>
      </div>
      <div className={`text-center py-4 text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>© 2022–2026 Smart Kids School</div>
    </div>
  );
}
