import { Component, type ErrorInfo, type ReactNode } from 'react';
import { parseLocaleFromPath } from '../i18n/routing';

const T = {
  FR: { title: "Une erreur est survenue", desc: "Quelque chose s'est mal passé de notre côté. Rechargez la page ou revenez à l'accueil.", reload: 'Recharger la page', home: "Retour à l'accueil" },
  EN: { title: 'Something went wrong', desc: 'Something broke on our end. Reload the page or go back to the homepage.', reload: 'Reload page', home: 'Back to homepage' },
  DE: { title: 'Ein Fehler ist aufgetreten', desc: 'Bei uns ist etwas schiefgelaufen. Laden Sie die Seite neu oder kehren Sie zur Startseite zurück.', reload: 'Seite neu laden', home: 'Zurück zur Startseite' },
} as const;

interface Props { children: ReactNode }
interface State { hasError: boolean }

// Filet de sécurité ultime : sans ceci, une exception pendant le rendu de
// N'IMPORTE QUEL composant de l'arbre (donnée malformée, dépendance tierce en
// erreur...) fait disparaître tout le site en un écran blanc silencieux, sans
// aucun moyen de s'en sortir pour le visiteur. Volontairement en dehors du
// routeur/contexte de langue habituel (peut se déclencher avant qu'ils soient
// disponibles) : la langue est déduite directement de l'URL.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erreur non interceptée dans l\'arbre React:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const { locale } = parseLocaleFromPath(window.location.pathname);
    const t = T[locale];
    let darkMode = false;
    try { darkMode = localStorage.getItem('sks_theme') === 'dark'; } catch { /* ignore */ }

    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <div className="max-w-md text-center">
          <i className="ri-error-warning-line text-5xl text-[#d99a2b] mb-4 block"></i>
          <h1 className="text-2xl font-bold mb-2">{t.title}</h1>
          <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.desc}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button type="button" onClick={() => window.location.reload()} className="px-5 py-2.5 rounded-full bg-[#232999] text-white text-sm font-semibold cursor-pointer">{t.reload}</button>
            <a href="/" className={`px-5 py-2.5 rounded-full text-sm font-semibold border ${darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}>{t.home}</a>
          </div>
        </div>
      </div>
    );
  }
}
