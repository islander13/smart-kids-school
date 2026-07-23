import { useState, type FormEvent } from 'react';
import { localizedPath } from '../i18n/routing';

type Lang = 'FR' | 'EN' | 'DE';

interface FooterProps {
  currentLang: Lang;
  darkMode: boolean;
}

// ─────────────────────────────────────────────────────────────────────────
// Footer unique et canonique, utilisé par TOUTES les pages du site.
// Pour modifier le footer : ne le faire QU'ICI. Le changement s'applique
// automatiquement à toutes les pages qui importent ce composant.
//
// Usage dans une page :
//   import Footer from '../components/Footer';
//   ...
//   <Footer currentLang={currentLang} darkMode={darkMode} />
// ─────────────────────────────────────────────────────────────────────────

export default function Footer({ currentLang, darkMode }: FooterProps) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const tr = (fr: string, en: string, de: string) =>
    currentLang === 'FR' ? fr : currentLang === 'EN' ? en : de;
  const lp = (path: string) => localizedPath(path, currentLang);

  const handleNewsletterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setNewsletterStatus('sending');
    try {
      const body = new URLSearchParams();
      body.append('form-name', 'newsletter');
      body.append('email', newsletterEmail);
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (res.ok) {
        setNewsletterStatus('success');
        setNewsletterEmail('');
      } else {
        setNewsletterStatus('error');
      }
    } catch {
      setNewsletterStatus('error');
    }
  };

  return (
    <footer className={`py-16 px-4 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-900 to-gray-800'} text-white`}>
      <div className="max-w-5xl mx-auto">

        {/* ── Newsletter "Restons connectés" ── */}
        <div className={`mb-12 p-8 rounded-3xl border ${darkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/5 border-white/10'}`}>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <span className="text-3xl">📬</span>
                {tr('Restons connectés', 'Stay connected', 'Bleiben wir in Kontakt')}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {tr(
                  'Recevez nos offres, nouveaux thèmes de stage et conseils pour les jeunes codeurs. 1 email par mois, soigneusement préparé.',
                  'Get our offers, new camp themes and tips for young coders. 1 email per month, carefully crafted.',
                  'Erhalten Sie Angebote, neue Camp-Themen und Tipps für junge Coder. 1 E-Mail pro Monat, sorgfältig zusammengestellt.'
                )}
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} name="newsletter" data-netlify="true" className="flex flex-col sm:flex-row gap-2">
              <input type="hidden" name="form-name" value="newsletter" />
              <input
                type="email"
                name="email"
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                required
                placeholder={tr('votre@email.com', 'your@email.com', 'ihre@email.com')}
                className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-white/40 text-sm"
                disabled={newsletterStatus === 'sending' || newsletterStatus === 'success'}
              />
              <button
                type="submit"
                disabled={newsletterStatus === 'sending' || newsletterStatus === 'success'}
                className="bg-[#232999] hover:bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold text-sm transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                {newsletterStatus === 'sending'
                  ? tr('Envoi...', 'Sending...', 'Wird gesendet...')
                  : newsletterStatus === 'success'
                  ? tr('✓ Inscrit !', '✓ Subscribed!', '✓ Eingetragen!')
                  : tr("S'inscrire", 'Subscribe', 'Eintragen')}
              </button>
            </form>
          </div>
          {newsletterStatus === 'error' && (
            <p className="text-red-300 text-xs mt-3">
              {tr(
                "Une erreur s'est produite. Réessayez ou écrivez-nous directement.",
                'An error occurred. Try again or write to us directly.',
                'Ein Fehler ist aufgetreten. Versuchen Sie es erneut.'
              )}
            </p>
          )}
        </div>

        {/* ── Colonnes : marque · liens · contact ── */}
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <img src="/Logo_official_dark.png" alt="Smart Kids School" loading="lazy" width="168" height="56" className="h-14 w-auto mb-6" />
            <p className="text-gray-400 leading-relaxed mb-6 text-sm">
              {tr(
                "Smart Kids School (SKS) est une école en ligne qui initie les jeunes esprits à la programmation, la robotique et l'intelligence artificielle. Conçue par des ingénieurs EPFL & ETHZ.",
                'Smart Kids School (SKS) is an online school introducing young minds to programming, robotics and AI. Designed by EPFL & ETHZ engineers.',
                'Smart Kids School (SKS) ist eine Online-Schule, die junge Menschen an Programmierung, Robotik und KI heranführt. Konzipiert von EPFL- und ETHZ-Ingenieuren.'
              )}
            </p>
            {/* Masqué en attendant la confirmation officielle du partenariat.
                Pour réafficher : changer `{false &&` en `{true &&`. */}
            {false && (
            <p className="text-gray-500 text-xs mb-4">
              {tr('En collaboration avec', 'In collaboration with', 'In Zusammenarbeit mit')}{' '}
              <a href="https://www.levalentin.ch/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">École du Valentin</a>
            </p>
            )}
            <div className="flex gap-4">
              <a href="https://www.facebook.com/smartkidsschool.suisse" target="_blank" rel="noopener noreferrer nofollow" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#232999] transition-colors cursor-pointer" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://instagram.com/smart.kids_school" target="_blank" rel="noopener noreferrer nofollow" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#232999] transition-colors cursor-pointer" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">{tr('Liens utiles', 'Useful links', 'Nützliche Links')}</h3>
            <ul className="space-y-3 text-sm">
              <li><a href={lp('/')} className="text-gray-400 hover:text-indigo-400 transition-colors">{tr('Accueil', 'Home', 'Startseite')}</a></li>
              <li><a href={lp('/#parcours')} className="text-gray-400 hover:text-indigo-400 transition-colors">{tr('Programme', 'Program', 'Programm')}</a></li>
              <li><a href={lp('/tarifs')} className="text-gray-400 hover:text-indigo-400 transition-colors">{tr('Tarifs', 'Pricing', 'Preise')}</a></li>
              <li><a href={lp('/premium')} className="text-gray-400 hover:text-indigo-400 transition-colors">Premium</a></li>
              <li><a href={lp('/stages')} className="text-gray-400 hover:text-indigo-400 transition-colors">{tr('Stages', 'Camps', 'Camps')}</a></li>
              <li><a href={lp('/faq')} className="text-gray-400 hover:text-indigo-400 transition-colors">FAQ</a></li>
              <li><a href={lp('/cgv')} className="text-gray-400 hover:text-indigo-400 transition-colors">{tr('CGV', 'Terms', 'AGB')}</a></li>
              <li><a href={lp('/legal')} className="text-gray-400 hover:text-indigo-400 transition-colors">{tr('Mentions Légales', 'Legal Notice', 'Impressum')}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-gray-400"><i className="ri-map-pin-line text-indigo-400 mt-1"></i><span>Avenue d'Echallens 60<br/>1004 Lausanne, Suisse</span></li>
              <li className="flex items-start gap-2"><i className="ri-phone-line text-indigo-400 mt-1"></i><a href="https://wa.me/41774768492" className="text-gray-400 hover:text-indigo-400 transition-colors">(+41) 077 476 84 92</a></li>
              <li className="flex items-start gap-2"><i className="ri-mail-line text-indigo-400 mt-1"></i><a href="mailto:contact@smartkids-school.ch" className="text-gray-400 hover:text-indigo-400 transition-colors">contact@smartkids-school.ch</a></li>
            </ul>
          </div>
        </div>

        {/* ── Barre copyright ── */}
        <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
          <p>
            © 2022–{new Date().getFullYear()} Smart Kids School · {tr('Tous droits réservés', 'All rights reserved', 'Alle Rechte vorbehalten')}
            {' | '}
            <a href={lp('/legal')} className="hover:text-indigo-400 transition-colors">{tr('Mentions Légales', 'Legal Notice', 'Impressum')}</a>
            {' | '}
            <a href={lp('/cgv')} className="hover:text-indigo-400 transition-colors">{tr('CGV', 'Terms', 'AGB')}</a>
          </p>
        </div>

      </div>
    </footer>
  );
}
