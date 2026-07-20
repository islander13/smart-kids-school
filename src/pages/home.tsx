import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { parseLocaleFromPath, localizedPath, setHreflangTags } from '../i18n/routing';

// ─── Translations ────────────────────────────────────────────────────────────
type Lang = 'FR' | 'EN' | 'DE';

interface Translations {
  // Nav
  accueil: string; programme: string; faq: string; inscrire: string;
  // Hero
  heroTitle1: string; heroTitle2: string; heroDesc: string; discoverProgram: string; studentsTrained: string; satisfaction: string;
  // Benefits
  whyChoose: string; benefitsTitle: string; benefitsDesc: string; benefit1Title: string; benefit1Desc: string; benefit2Title: string; benefit2Desc: string; benefit4Title: string; benefit4Desc: string; benefit6Title: string; benefit6Desc: string;
  // Scratch
  scratchTitle: string; scratch1Title: string; scratch1Desc: string; scratch2Title: string; scratch2Desc: string; scratch3Title: string; scratch3Desc: string; scratch4Title: string; scratch4Desc: string; exampleProject: string; exampleProjectDesc: string;
  // FAQ
  faqLabel: string; faqTitle: string; faqDesc: string;
  faq1Q: string; faq1A: string; faq2Q: string; faq2A: string; faq3Q: string; faq3A: string;
  faq4Q: string; faq4A: string; faq5Q: string; faq5A: string; faq6Q: string; faq6A: string;
  faq7Q: string; faq7A: string; faq8Q: string; faq8A: string;
  // Contact
  contactTitle: string; contactDesc: string;
  fullName: string; phoneOptional: string; message: string; messagePlaceholder: string;
  sendMessage: string; sending: string; thankYou: string; errorMsg: string;
  // Footer
  footerDesc: string; usefulLinks: string; home: string; cgv: string;
  // Cookies
  cookieTitle: string; cookieDesc: string; cookieFunctional: string; cookieFunctionalDesc: string; cookiePreferences: string; cookiePreferencesDesc: string; cookieStats: string; cookieStatsDesc: string; cookieMarketing: string; cookieMarketingDesc: string; cookieAccept: string; cookieRefuse: string; cookieManage: string; cookiePolicy: string; cookieAlwaysActive: string;
}

const T: Record<Lang, Translations> = {
  FR: {
    // Nav
    accueil: 'Accueil',
    programme: 'Programme',
    faq: 'FAQ',
    inscrire: 'Inscrivez votre enfant',
    // Hero
    heroTitle1: 'Apprendre à coder,',
    heroTitle2: 'créer, imaginer',
    heroDesc: "Smart Kids School accompagne les enfants dès 7 ans dans leurs premiers pas en programmation, robotique et intelligence artificielle. Un parcours progressif, conçu par des ingénieurs diplômés EPFL & ETHZ, qui transforme la curiosité en savoir-faire.",
    discoverProgram: 'Découvrir le Parcours',
    studentsTrained: 'Élèves Formés',
    satisfaction: 'Satisfaction',
    // Benefits
    whyChoose: 'Pourquoi Choisir SKS',
    benefitsTitle: 'Les Avantages pour Votre Enfant',
    benefitsDesc: "Plus qu'un simple cours de programmation, c'est une expérience qui développe des compétences essentielles pour l'avenir",
    benefit1Title: 'Développe la Créativité',
    benefit1Desc: 'Votre enfant apprend à transformer ses idées en animations et jeux interactifs, stimulant son imagination sans limites.',
    benefit2Title: 'Renforce la Logique',
    benefit2Desc: 'La programmation enseigne la résolution de problèmes et la pensée structurée, des compétences utiles dans tous les domaines.',
    benefit4Title: 'Confiance en Soi',
    benefit4Desc: "Chaque projet terminé renforce l'estime de soi et la fierté d'avoir créé quelque chose de concret et fonctionnel.",
    benefit6Title: 'Compétences du Futur',
    benefit6Desc: "Préparez votre enfant aux métiers de demain en lui donnant une longueur d'avance dans le monde numérique.",
    // Scratch
    scratchTitle: 'Pourquoi commencer par Scratch ?',
    scratch1Title: 'Interface Visuelle Intuitive',
    scratch1Desc: "Pas besoin de taper du code ! Les blocs colorés s'assemblent comme des puzzles.",
    scratch2Title: 'Résultats Immédiats',
    scratch2Desc: 'Votre enfant voit instantanément le résultat de son code, ce qui maintient sa motivation.',
    scratch3Title: 'Communauté Mondiale',
    scratch3Desc: "Scratch est utilisé par des millions d'enfants dans le monde entier, avec une vaste bibliothèque de projets.",
    scratch4Title: 'Développé par le MIT',
    scratch4Desc: "Créé par des experts en éducation du Massachusetts Institute of Technology.",
    exampleProject: 'Exemple de Projet',
    exampleProjectDesc: "Votre enfant créera des jeux interactifs, des animations et des histoires en utilisant des blocs de code visuels.",
    // FAQ
    faqLabel: 'Questions fréquentes',
    faqTitle: 'Vos questions, nos réponses',
    faqDesc: "Les questions essentielles avant d'inscrire votre enfant. Pour plus de détails, consultez notre FAQ complète.",
    faq1Q: "Mon enfant n'a aucune expérience en programmation. Est-ce un problème ?",
    faq1A: "Absolument pas ! Nos cours sont spécialement conçus pour les débutants complets. Nous commençons par les bases et progressons à un rythme adapté à chaque enfant.",
    faq2Q: "Quel matériel est nécessaire pour suivre les cours ?",
    faq2A: "Un ordinateur (PC, Mac ou Chromebook) avec une connexion internet stable, un casque ou écouteurs, et idéalement une webcam. Tout se fait dans le navigateur.",
    faq3Q: "Comment se déroulent les séances en ligne ?",
    faq3A: "Les séances se déroulent en visioconférence avec un enseignant dédié. Votre enfant peut voir l'écran, poser des questions en direct et partager son écran. Durée : 1h.",
    faq4Q: "À partir de quel âge peut-on commencer ?",
    faq4A: "Nous accueillons les enfants à partir de 7 ans. Le contenu est adapté à chaque tranche d'âge, des premiers pas avec Scratch jusqu'à Python avancé.",
    faq5Q: "Y a-t-il un certificat à la fin du parcours ?",
    faq5A: "Oui, chaque enfant reçoit un certificat de formation reconnaissant les compétences acquises et les projets réalisés.",
    faq6Q: "Que se passe-t-il si mon enfant manque une séance ?",
    faq6A: "Les séances peuvent être reprogrammées avec un préavis de 24h. Nous fournissons aussi un résumé des notions vues et des exercices pour rattraper le contenu si besoin.",
    faq7Q: "Qui anime les cours ?",
    faq7A: "Nos cours sont animés par des enseignants formés à notre méthode pédagogique, conçue par des ingénieurs EPFL et ETHZ. Tous nos enseignants partagent la même passion : transmettre la programmation avec patience et bienveillance.",
    faq8Q: "Puis-je assister aux séances avec mon enfant ?",
    faq8A: "Pour les plus jeunes (7-9 ans), nous encourageons la présence d'un parent à proximité pour l'assistance technique si nécessaire. Les enfants plus âgés suivent généralement de manière autonome.",
    // Contact
    contactTitle: 'Contactez-nous',
    contactDesc: "Une question, un projet, ou simplement envie d'en savoir plus ? Écrivez-nous, nous répondons sous 24h.",
    fullName: 'Nom et prénom',
    phoneOptional: 'Téléphone (optionnel)',
    message: 'Message',
    messagePlaceholder: 'Votre message, vos questions...',
    sendMessage: 'Envoyer le message',
    sending: 'Envoi en cours...',
    thankYou: 'Merci ! Nous vous répondons sous 24h.',
    errorMsg: "Une erreur s'est produite. Merci d'écrire directement à contact@smartkids-school.ch",
    // Footer
    footerDesc: "Smart Kids School (SKS) est une école en ligne qui initie les jeunes esprits aux disciplines les plus innovantes d'aujourd'hui. Nos programmes couvrent la programmation, la robotique, l'intelligence artificielle et bien plus encore.",
    usefulLinks: 'Liens Utiles',
    home: 'Accueil',
    cgv: 'Conditions Générales de Vente',
    // Cookies
    cookieTitle: 'Nous respectons votre vie privée',
    cookieDesc: "Pour vous offrir la meilleure expérience, nous utilisons des technologies telles que les cookies pour stocker et accéder aux informations de votre appareil. En acceptant, nous pourrons traiter des données comme votre comportement de navigation sur ce site. Vous pouvez refuser ou retirer votre consentement à tout moment.",
    cookieFunctional: 'Fonctionnels',
    cookieFunctionalDesc: 'Essentiels pour le fonctionnement du site.',
    cookiePreferences: 'Préférences',
    cookiePreferencesDesc: 'Mémorisation de vos choix et paramètres.',
    cookieStats: 'Statistiques',
    cookieStatsDesc: "Analyse de l'usage pour améliorer le site.",
    cookieMarketing: 'Marketing',
    cookieMarketingDesc: 'Personnalisation des contenus et publicités.',
    cookieAccept: 'Accepter',
    cookieRefuse: 'Refuser',
    cookieManage: 'Gérer mes préférences',
    cookiePolicy: 'Politique de Cookies',
    cookieAlwaysActive: 'Toujours actif',
  },
  EN: {
    // Nav
    accueil: 'Home',
    programme: 'Curriculum',
    faq: 'FAQ',
    inscrire: 'Enroll your child',
    // Hero
    heroTitle1: 'Learn to code,',
    heroTitle2: 'create, imagine',
    heroDesc: 'Smart Kids School supports children from age 7 in their first steps with programming, robotics and artificial intelligence. A progressive path, designed by EPFL & ETHZ engineers, that turns curiosity into know-how.',
    discoverProgram: 'Discover the Path',
    studentsTrained: 'Students Trained',
    satisfaction: 'Satisfaction',
    // Benefits
    whyChoose: 'Why Choose SKS',
    benefitsTitle: 'Benefits for Your Child',
    benefitsDesc: "More than just a programming course, it's an experience that develops essential skills for the future",
    benefit1Title: 'Develops Creativity',
    benefit1Desc: 'Your child learns to transform ideas into interactive animations and games, stimulating their imagination without limits.',
    benefit2Title: 'Strengthens Logic',
    benefit2Desc: 'Programming teaches problem-solving and structured thinking, skills useful in all areas.',
    benefit4Title: 'Self-Confidence',
    benefit4Desc: 'Each completed project reinforces self-esteem and the pride of having created something concrete and functional.',
    benefit6Title: 'Future Skills',
    benefit6Desc: "Prepare your child for tomorrow's jobs by giving them a head start in the digital world.",
    // Scratch
    scratchTitle: 'Why start with Scratch?',
    scratch1Title: 'Intuitive Visual Interface',
    scratch1Desc: "No need to type code! Colorful blocks fit together like puzzles.",
    scratch2Title: 'Immediate Results',
    scratch2Desc: 'Your child instantly sees the result of their code, which maintains their motivation.',
    scratch3Title: 'Global Community',
    scratch3Desc: "Scratch is used by millions of children worldwide, with a vast library of projects.",
    scratch4Title: 'Developed by MIT',
    scratch4Desc: "Created by education experts at the Massachusetts Institute of Technology.",
    exampleProject: 'Example Project',
    exampleProjectDesc: "Your child will create interactive games, animations and stories using visual code blocks.",
    // FAQ
    faqLabel: 'Frequently asked questions',
    faqTitle: 'Your questions, our answers',
    faqDesc: 'The essential questions before enrolling your child. For more details, see our full FAQ.',
    faq1Q: "My child has no programming experience. Is that a problem?",
    faq1A: "Not at all! Our classes are specially designed for complete beginners. We start with the basics and progress at a pace adapted to each child.",
    faq2Q: "What equipment is needed?",
    faq2A: "A computer (PC, Mac or Chromebook) with stable internet, headphones, and ideally a webcam. Everything works in the browser.",
    faq3Q: "How do online sessions work?",
    faq3A: "Sessions take place via video conference with a dedicated teacher. Your child can see the screen, ask questions live, and share their screen. Duration: 1h.",
    faq4Q: "What's the minimum age?",
    faq4A: "We welcome children from age 7. Content is adapted to each age group, from Scratch first steps to advanced Python.",
    faq5Q: "Is there a certificate?",
    faq5A: "Yes, each child receives a training certificate recognizing their skills and completed projects.",
    faq6Q: "What if my child misses a session?",
    faq6A: "Sessions can be rescheduled with 24h notice. We also provide a summary and exercises to catch up if needed.",
    faq7Q: "Who teaches the classes?",
    faq7A: "Our classes are taught by teachers trained in our pedagogical method, designed by EPFL and ETHZ engineers. All our teachers share the same passion: making programming accessible with patience and care.",
    faq8Q: "Can I attend sessions with my child?",
    faq8A: "For younger children (7-9), we encourage a parent to be nearby for technical assistance. Older children usually follow independently.",
    // Contact
    contactTitle: 'Contact us',
    contactDesc: "A question, a project, or just want to know more? Write to us, we reply within 24h.",
    fullName: 'Full name',
    phoneOptional: 'Phone (optional)',
    message: 'Message',
    messagePlaceholder: 'Your message, your questions...',
    sendMessage: 'Send message',
    sending: 'Sending...',
    thankYou: 'Thanks! We will reply within 24h.',
    errorMsg: "An error occurred. Please write directly to contact@smartkids-school.ch",
    // Footer
    footerDesc: "Smart Kids School (SKS) is an online school that introduces young minds to the most innovative disciplines of today. Our programs cover programming, robotics, artificial intelligence and much more.",
    usefulLinks: 'Useful Links',
    home: 'Home',
    cgv: 'Terms & Conditions',
    // Cookies
    cookieTitle: 'We respect your privacy',
    cookieDesc: "To offer you the best experience, we use technologies such as cookies to store and access information on your device. By accepting, we can process data such as your browsing behaviour on this site. You can refuse or withdraw your consent at any time.",
    cookieFunctional: 'Functional',
    cookieFunctionalDesc: 'Essential for the website to function.',
    cookiePreferences: 'Preferences',
    cookiePreferencesDesc: 'Remembering your choices and settings.',
    cookieStats: 'Statistics',
    cookieStatsDesc: 'Usage analysis to improve the site.',
    cookieMarketing: 'Marketing',
    cookieMarketingDesc: 'Personalisation of content and advertisements.',
    cookieAccept: 'Accept',
    cookieRefuse: 'Decline',
    cookieManage: 'Manage my preferences',
    cookiePolicy: 'Cookie Policy',
    cookieAlwaysActive: 'Always active',
  },
  DE: {
    // Nav
    accueil: 'Startseite',
    programme: 'Programm',
    faq: 'FAQ',
    inscrire: 'Kind anmelden',
    // Hero
    heroTitle1: 'Programmieren lernen,',
    heroTitle2: 'erschaffen, erfinden',
    heroDesc: 'Smart Kids School begleitet Kinder ab 7 Jahren bei ihren ersten Schritten in Programmieren, Robotik und KI. Ein progressiver Weg, von EPFL- und ETHZ-Ingenieuren konzipiert, der Neugier in Können verwandelt.',
    discoverProgram: 'Den Weg entdecken',
    studentsTrained: 'Ausgebildete Schüler',
    satisfaction: 'Zufriedenheit',
    // Benefits
    whyChoose: 'Warum SKS wählen',
    benefitsTitle: 'Vorteile für Ihr Kind',
    benefitsDesc: 'Mehr als nur ein Programmierkurs – eine Erfahrung, die wesentliche Fähigkeiten für die Zukunft entwickelt',
    benefit1Title: 'Kreativität fördern',
    benefit1Desc: 'Ihr Kind lernt, Ideen in interaktive Animationen und Spiele umzuwandeln und regt seine Fantasie an.',
    benefit2Title: 'Logik stärken',
    benefit2Desc: 'Programmieren lehrt Problemlösung und strukturiertes Denken – nützliche Fähigkeiten in allen Bereichen.',
    benefit4Title: 'Selbstvertrauen',
    benefit4Desc: 'Jedes abgeschlossene Projekt stärkt das Selbstwertgefühl und den Stolz, etwas Konkretes geschaffen zu haben.',
    benefit6Title: 'Zukunftskompetenzen',
    benefit6Desc: 'Bereiten Sie Ihr Kind auf die Berufe von morgen vor und geben Sie ihm einen Vorsprung in der digitalen Welt.',
    // Scratch
    scratchTitle: 'Warum mit Scratch beginnen?',
    scratch1Title: 'Intuitive visuelle Oberfläche',
    scratch1Desc: 'Kein Code tippen nötig! Bunte Blöcke fügen sich wie Puzzleteile zusammen.',
    scratch2Title: 'Sofortige Ergebnisse',
    scratch2Desc: 'Ihr Kind sieht sofort das Ergebnis seines Codes, was die Motivation aufrechterhält.',
    scratch3Title: 'Weltweite Gemeinschaft',
    scratch3Desc: 'Scratch wird von Millionen Kindern weltweit genutzt, mit einer riesigen Projektbibliothek.',
    scratch4Title: 'Entwickelt vom MIT',
    scratch4Desc: 'Erstellt von Bildungsexperten des Massachusetts Institute of Technology.',
    exampleProject: 'Beispielprojekt',
    exampleProjectDesc: 'Ihr Kind wird interaktive Spiele, Animationen und Geschichten mit visuellen Code-Blöcken erstellen.',
    // FAQ
    faqLabel: 'Häufige Fragen',
    faqTitle: 'Ihre Fragen, unsere Antworten',
    faqDesc: 'Die wichtigsten Fragen vor der Anmeldung. Für mehr Details sehen Sie unsere vollständige FAQ.',
    faq1Q: "Mein Kind hat keine Programmiererfahrung. Ist das ein Problem?",
    faq1A: "Überhaupt nicht! Unsere Kurse sind speziell für absolute Anfänger konzipiert. Wir beginnen mit den Grundlagen und schreiten in kindgerechtem Tempo voran.",
    faq2Q: "Welches Material wird benötigt?",
    faq2A: "Ein Computer (PC, Mac oder Chromebook) mit stabiler Internetverbindung, Kopfhörer und idealerweise eine Webcam. Alles funktioniert im Browser.",
    faq3Q: "Wie laufen die Online-Sitzungen ab?",
    faq3A: "Per Videokonferenz mit einer dedizierten Lehrperson. Ihr Kind sieht den Bildschirm, kann live Fragen stellen und seinen eigenen Bildschirm teilen. Dauer: 1h.",
    faq4Q: "Ab welchem Alter?",
    faq4A: "Wir nehmen Kinder ab 7 Jahren auf. Die Inhalte sind altersgerecht, von den ersten Schritten mit Scratch bis zu fortgeschrittenem Python.",
    faq5Q: "Gibt es ein Zertifikat?",
    faq5A: "Ja, jedes Kind erhält ein Ausbildungszertifikat, das die erworbenen Fähigkeiten und abgeschlossenen Projekte anerkennt.",
    faq6Q: "Was passiert, wenn mein Kind eine Sitzung verpasst?",
    faq6A: "Sitzungen können mit 24h Vorankündigung umgeplant werden. Wir liefern auch Zusammenfassung und Übungen zum Aufholen.",
    faq7Q: "Wer unterrichtet die Kurse?",
    faq7A: "Unsere Kurse werden von Lehrkräften unterrichtet, die in unserer pädagogischen Methode geschult sind, entwickelt von EPFL- und ETHZ-Ingenieuren. Alle teilen dieselbe Leidenschaft: Programmierung mit Geduld und Sorgfalt zu vermitteln.",
    faq8Q: "Kann ich an Sitzungen teilnehmen?",
    faq8A: "Für jüngere Kinder (7-9) empfehlen wir die Anwesenheit eines Elternteils für technische Hilfe. Ältere folgen meist autonom.",
    // Contact
    contactTitle: 'Kontaktieren Sie uns',
    contactDesc: "Eine Frage, ein Projekt, oder einfach mehr erfahren? Schreiben Sie uns, wir antworten innerhalb 24h.",
    fullName: 'Vor- und Nachname',
    phoneOptional: 'Telefon (optional)',
    message: 'Nachricht',
    messagePlaceholder: 'Ihre Nachricht, Ihre Fragen...',
    sendMessage: 'Nachricht senden',
    sending: 'Wird gesendet...',
    thankYou: 'Danke! Wir antworten innerhalb 24h.',
    errorMsg: "Ein Fehler ist aufgetreten. Bitte schreiben Sie direkt an contact@smartkids-school.ch",
    // Footer
    footerDesc: 'Smart Kids School (SKS) ist eine Online-Schule, die junge Geister in die innovativsten Disziplinen von heute einführt. Unsere Programme umfassen Programmierung, Robotik, Künstliche Intelligenz und vieles mehr.',
    usefulLinks: 'Nützliche Links',
    home: 'Startseite',
    cgv: 'Allgemeine Geschäftsbedingungen',
    // Cookies
    cookieTitle: 'Wir respektieren Ihre Privatsphäre',
    cookieDesc: "Um Ihnen die beste Erfahrung zu bieten, verwenden wir Technologien wie Cookies, um Informationen auf Ihrem Gerät zu speichern und darauf zuzugreifen. Durch die Zustimmung können wir Daten wie Ihr Surfverhalten auf dieser Website verarbeiten. Sie können Ihre Einwilligung jederzeit widerrufen.",
    cookieFunctional: 'Funktional',
    cookieFunctionalDesc: 'Wesentlich für das Funktionieren der Website.',
    cookiePreferences: 'Präferenzen',
    cookiePreferencesDesc: 'Speicherung Ihrer Einstellungen und Optionen.',
    cookieStats: 'Statistiken',
    cookieStatsDesc: 'Nutzungsanalyse zur Verbesserung der Website.',
    cookieMarketing: 'Marketing',
    cookieMarketingDesc: 'Personalisierung von Inhalten und Werbung.',
    cookieAccept: 'Akzeptieren',
    cookieRefuse: 'Ablehnen',
    cookieManage: 'Einstellungen verwalten',
    cookiePolicy: 'Cookie-Richtlinie',
    cookieAlwaysActive: 'Immer aktiv',
  },
};

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactFormData, setContactFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [currentLang, setCurrentLang] = useState<Lang>(() => parseLocaleFromPath(window.location.pathname).locale);
  const navigate = useNavigate();
  const lp = (path: string) => localizedPath(path, currentLang);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try { return localStorage.getItem('sks_theme') === 'dark'; } catch { return false; }
  });
  const [cookieConsent, setCookieConsent] = useState<'accepted' | 'refused' | 'pending'>(() => {
    return (localStorage.getItem('cookie_consent') as any) || 'pending';
  });
  const [showCookieDetails, setShowCookieDetails] = useState(false);
  const [cookiePrefs, setCookiePrefs] = useState<{stats: boolean; marketing: boolean}>(() => {
    try {
      const saved = localStorage.getItem('cookie_prefs');
      return saved ? JSON.parse(saved) : { stats: true, marketing: false };
    } catch { return { stats: true, marketing: false }; }
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      try { localStorage.setItem('sks_theme', 'dark'); } catch {}
    } else {
      document.documentElement.classList.remove('dark');
      try { localStorage.setItem('sks_theme', 'light'); } catch {}
    }
  }, [darkMode]);

  // Re-sync depuis localStorage quand l'onglet redevient visible
  // (fix : sur mobile iOS/Android, le retour depuis une autre app peut réinitialiser l'état React)
  useEffect(() => {
    const sync = () => {
      if (document.visibilityState === 'visible') {
        try {
          const saved = localStorage.getItem('sks_theme');
          if (saved === 'dark') setDarkMode(true);
          else if (saved === 'light') setDarkMode(false);
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

  useEffect(() => {
    const langMap: Record<string, string> = { FR: 'fr', EN: 'en', DE: 'de' };
    document.documentElement.lang = langMap[currentLang] || 'fr';
    const titles: Record<string, string> = {
      FR: 'Smart Kids School, Programmation, robotique et IA pour enfants en Suisse romande',
      EN: 'Smart Kids School, Coding, robotics and AI for kids across Switzerland',
      DE: 'Smart Kids School, Programmieren, Robotik und KI für Kinder in der Schweiz',
    };
    const descriptions: Record<string, string> = {
      FR: 'École en ligne de programmation pour enfants de 7 à 15 ans. Cours conçus par des ingénieurs EPFL & ETHZ. 100% en ligne, partout en Suisse romande : Lausanne, Genève, Fribourg, Neuchâtel, Sion, Vevey, Yverdon, Nyon, Morges. Scratch, Python, IA, robotique, STEM. Solo · Duo dès 169 CHF/mois par enfant.',
      EN: 'Online coding school for kids aged 7-15. Classes designed by EPFL & ETHZ engineers. 100% online, across Switzerland: Lausanne, Geneva, Fribourg, Neuchâtel. Scratch, Python, AI, robotics, STEM. Solo · Duo from CHF 169/month per child.',
      DE: 'Online-Programmierschule für Kinder von 7-15 Jahren. Kurse von EPFL- & ETHZ-Ingenieuren. 100% online, schweizweit. Scratch, Python, KI, Robotik, MINT. Solo · Duo ab 169 CHF/Monat pro Kind.',
    };
    document.title = titles[currentLang];
    const setMeta = (name: string, content: string, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.content = content;
    };
    setMeta('description', descriptions[currentLang]);
    setMeta('keywords', currentLang === 'FR' ? 'cours programmation enfant, cours coding enfant, cours Scratch, cours Python enfant, école programmation Suisse romande, cours informatique Lausanne, cours informatique Genève, cours robotique enfant, cours IA enfant, STEM enfant, EPFL, ETHZ' : 'kids coding classes, Scratch course, Python kids, programming school Switzerland, robotics kids, AI kids, STEM');
    setMeta('og:title', titles[currentLang], 'property');
    setMeta('og:description', descriptions[currentLang], 'property');
    setMeta('og:locale', currentLang === 'FR' ? 'fr_CH' : currentLang === 'EN' ? 'en_GB' : 'de_DE', 'property');
    setMeta('twitter:title', titles[currentLang]);
    setMeta('twitter:description', descriptions[currentLang]);

    // Chaque langue a sa propre URL indexable : canonical pointe sur la page
    // elle-même, et hreflang relie les 3 versions entre elles (voir i18n/routing.ts).
    setHreflangTags('/', currentLang);
    setMeta('og:url', `https://smartkids-school.ch${localizedPath('/', currentLang)}`, 'property');
    setMeta('og:image', 'https://smartkids-school.ch/og-image.jpg', 'property');
    setMeta('og:type', 'website', 'property');

    // JSON-LD with areaServed for SEO Suisse romande
    let ldEl = document.querySelector('script[type="application/ld+json"][data-sks="org"]') as HTMLScriptElement;
    if (!ldEl) {
      ldEl = document.createElement('script');
      ldEl.type = 'application/ld+json';
      ldEl.setAttribute('data-sks', 'org');
      document.head.appendChild(ldEl);
    }
    ldEl.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'Smart Kids School',
      url: 'https://smartkids-school.ch',
      logo: 'https://smartkids-school.ch/Logo_official_dark.png',
      description: descriptions[currentLang],
      email: 'contact@smartkids-school.ch',
      telephone: '+41774768492',
      address: {
        '@type': 'PostalAddress',
        streetAddress: "Avenue d'Echallens 60",
        postalCode: '1004',
        addressLocality: 'Lausanne',
        addressRegion: 'VD',
        addressCountry: 'CH',
      },
      areaServed: [
        { '@type': 'City', name: 'Lausanne' },
        { '@type': 'City', name: 'Genève' },
        { '@type': 'City', name: 'Fribourg' },
        { '@type': 'City', name: 'Neuchâtel' },
        { '@type': 'City', name: 'Sion' },
        { '@type': 'City', name: 'Vevey' },
        { '@type': 'City', name: 'Montreux' },
        { '@type': 'City', name: 'Yverdon-les-Bains' },
        { '@type': 'City', name: 'Nyon' },
        { '@type': 'City', name: 'Morges' },
        { '@type': 'City', name: 'La Chaux-de-Fonds' },
        { '@type': 'AdministrativeArea', name: 'Suisse romande' },
        { '@type': 'AdministrativeArea', name: 'Switzerland' },
      ],
      // sameAs: ['https://www.levalentin.ch/'], // masqué en attendant la confirmation du partenariat
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'CHF',
        lowPrice: '139',
        highPrice: '999',
        offerCount: '11',
      },
    });

    // ── JSON-LD additionnel : Course (cours de programmation) ──
    let courseEl = document.querySelector('script[type="application/ld+json"][data-sks="course"]') as HTMLScriptElement;
    if (!courseEl) {
      courseEl = document.createElement('script');
      courseEl.type = 'application/ld+json';
      courseEl.setAttribute('data-sks', 'course');
      document.head.appendChild(courseEl);
    }
    courseEl.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: currentLang === 'FR' ? 'Programmation, IA et Robotique pour enfants' : currentLang === 'EN' ? 'Coding, AI and Robotics for kids' : 'Programmieren, KI und Robotik für Kinder',
      description: currentLang === 'FR'
        ? 'Cours en ligne de programmation Scratch, Python, IA et robotique pour enfants de 7 à 15 ans en Suisse. 4 séances de 1h par mois. Bootcamp conçu par des ingénieurs EPFL & ETHZ.'
        : currentLang === 'EN'
        ? 'Online classes in Scratch, Python, AI and robotics for kids aged 7 to 15 in Switzerland. 4 sessions of 1h per month. Bootcamp designed by EPFL & ETHZ engineers.'
        : 'Online-Programmierkurse Scratch, Python, KI und Robotik für Kinder von 7 bis 15 Jahren in der Schweiz. 4 Sitzungen à 1h pro Monat.',
      provider: {
        '@type': 'EducationalOrganization',
        name: 'Smart Kids School',
        sameAs: 'https://smartkids-school.ch',
      },
      audience: {
        '@type': 'EducationalAudience',
        educationalRole: 'student',
        audienceType: 'children aged 7 to 15',
      },
      educationalLevel: 'beginner to advanced',
      teaches: ['Scratch', 'Python', 'Artificial Intelligence', 'Robotics', 'Logical thinking', 'STEM'],
      inLanguage: currentLang === 'FR' ? 'fr-CH' : currentLang === 'EN' ? 'en' : 'de-CH',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'CHF',
        price: '249',
        category: 'subscription',
        availability: 'https://schema.org/InStock',
      },
    });

    // ── JSON-LD additionnel : FAQPage (extrait des FAQ de la home) ──
    let faqEl = document.querySelector('script[type="application/ld+json"][data-sks="faq"]') as HTMLScriptElement;
    if (!faqEl) {
      faqEl = document.createElement('script');
      faqEl.type = 'application/ld+json';
      faqEl.setAttribute('data-sks', 'faq');
      document.head.appendChild(faqEl);
    }
    faqEl.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: T[currentLang].faq1Q,
          acceptedAnswer: { '@type': 'Answer', text: T[currentLang].faq1A },
        },
        {
          '@type': 'Question',
          name: T[currentLang].faq2Q,
          acceptedAnswer: { '@type': 'Answer', text: T[currentLang].faq2A },
        },
        {
          '@type': 'Question',
          name: T[currentLang].faq3Q,
          acceptedAnswer: { '@type': 'Answer', text: T[currentLang].faq3A },
        },
        {
          '@type': 'Question',
          name: T[currentLang].faq4Q,
          acceptedAnswer: { '@type': 'Answer', text: T[currentLang].faq4A },
        },
        {
          '@type': 'Question',
          name: T[currentLang].faq5Q,
          acceptedAnswer: { '@type': 'Answer', text: T[currentLang].faq5A },
        },
      ],
    });
  }, [currentLang]);

  const t = T[currentLang];

  const track = (event: string, props?: Record<string, string>) => {
    try {
      if (typeof window !== 'undefined' && (window as any).plausible) {
        (window as any).plausible(event, { props });
      }
    } catch {}
  };

  const acceptCookies = (prefs?: {stats: boolean; marketing: boolean}) => {
    const p = prefs || cookiePrefs;
    try {
      localStorage.setItem('cookie_consent', 'accepted');
      localStorage.setItem('cookie_prefs', JSON.stringify(p));
    } catch {}
    setCookiePrefs(p);
    setCookieConsent('accepted');
    if (p.stats && typeof window !== 'undefined' && !(window as any).plausible) {
      const s = document.createElement('script');
      s.defer = true;
      s.setAttribute('data-domain', 'smartkids-school.ch');
      s.src = 'https://plausible.io/js/script.js';
      document.head.appendChild(s);
    }
  };

  const refuseCookies = () => {
    try {
      localStorage.setItem('cookie_consent', 'refused');
      localStorage.setItem('cookie_prefs', JSON.stringify({ stats: false, marketing: false }));
    } catch {}
    setCookieConsent('refused');
  };

  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    try {
      const body = new URLSearchParams();
      body.append('form-name', 'contact');
      body.append('name', contactFormData.name);
      body.append('email', contactFormData.email);
      body.append('phone', contactFormData.phone);
      body.append('message', contactFormData.message);
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (res.ok) {
        setSubmitMessage(t.thankYou);
        setContactFormData({ name: '', email: '', phone: '', message: '' });
        try { (window as any).gtag?.('event', 'contact_submit'); } catch {}
      } else {
        setSubmitMessage(t.errorMsg);
      }
    } catch {
      setSubmitMessage(t.errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen font-['Inter',sans-serif] transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>

      {/* ── Navigation ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm shadow-sm transition-colors duration-300 ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center gap-3">
              <a href={lp('/')}><img src="Logo_official_dark.png" alt="Smart Kids School" width="192" height="64" className="h-16 w-auto" /></a>
              <img src="flag-ch.png" alt="Drapeau de la Suisse" width="24" height="24" className="h-6 w-auto flex-shrink-0 shadow-sm rounded-sm" />
            </div>
            <div className="hidden md:flex items-center space-x-8 ml-8">
              {[
                { href: '/', label: t.accueil },
                { href: '/#parcours', label: t.programme },
                { href: '/tarifs', label: currentLang === 'FR' ? 'Tarifs' : currentLang === 'EN' ? 'Pricing' : 'Preise' },
                { href: '/stages', label: currentLang === 'FR' ? 'Stages' : currentLang === 'EN' ? 'Camps' : 'Camps' },
                { href: '/faq', label: t.faq },
              ].map(item => (
                <a key={item.href} href={lp(item.href)} className={`text-sm font-medium transition-colors whitespace-nowrap ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{item.label}</a>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-3 ml-6">
              {/* DARK MODE TOGGLE : crescent moon icon */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-300 cursor-pointer ${darkMode ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-100 border-gray-200 text-gray-700 hover:border-indigo-400'}`}
                title={darkMode ? 'Mode clair' : 'Mode sombre'}
              >
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
                      <button key={lang} onClick={() => { setCurrentLang(lang); setShowLangDropdown(false); navigate(localizedPath('/', lang)); }}
                        className={`w-full px-4 py-2.5 text-sm text-left transition-colors cursor-pointer ${currentLang === lang ? 'bg-[#232999] text-white font-semibold' : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-indigo-50'}`}>
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <a href={lp('/tarifs')} className="bg-[#232999] hover:bg-[#1a1f7a] text-white px-6 py-3 rounded-full text-sm font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 whitespace-nowrap cursor-pointer">{t.inscrire}</a>
            </div>
            <div className="md:hidden flex items-center gap-2">
              {/* MOBILE DARK MODE TOGGLE : crescent moon icon */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 cursor-pointer ${darkMode ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-100 border-gray-200 text-gray-700'}`}
              >
              {darkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`p-2 rounded-lg transition-colors cursor-pointer ${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}>
                <i className={`ri-${mobileMenuOpen ? 'close' : 'menu'}-line text-2xl`}></i>
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className={`md:hidden border-t ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="px-4 py-4 space-y-3">
              {[{ href: '/', label: t.accueil }, { href: '/#parcours', label: t.programme }, { href: '/tarifs', label: currentLang === 'FR' ? 'Tarifs' : currentLang === 'EN' ? 'Pricing' : 'Preise' }, { href: '/stages', label: currentLang === 'FR' ? 'Stages' : currentLang === 'EN' ? 'Camps' : 'Camps' }, { href: '/faq', label: t.faq }].map(item => (
                <a key={item.href} href={lp(item.href)} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{item.label}</a>
              ))}
              <div className="flex gap-2 py-2">
                {(['FR', 'EN', 'DE'] as Lang[]).map(lang => (
                  <button key={lang} onClick={() => { setCurrentLang(lang); navigate(localizedPath('/', lang)); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentLang === lang ? 'bg-[#232999] text-white' : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{lang}</button>
                ))}
              </div>
              <a href={lp('/tarifs')} onClick={() => setMobileMenuOpen(false)} className="block w-full bg-[#232999] text-white px-6 py-3 rounded-full text-sm font-semibold cursor-pointer whitespace-nowrap text-center">{t.inscrire}</a>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className={`relative pt-32 pb-20 px-4 overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800' : 'bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-50'}`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#232999] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold inline-block ${darkMode ? 'bg-indigo-900/60 text-indigo-300' : 'bg-indigo-100 text-indigo-800'}`}>
                🎓 {currentLang === 'FR' ? 'Tout niveau · à partir de 7 ans' : currentLang === 'EN' ? 'All levels · from age 7' : 'Alle Niveaus · ab 7 Jahren'}
              </span>
              <h1 className={`text-5xl lg:text-6xl font-bold leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {t.heroTitle1}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#232999] to-indigo-500"> {t.heroTitle2}</span>
              </h1>
              <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.heroDesc}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href={lp('/tarifs')} onClick={() => track('hero_cta_click')} className="bg-[#232999] hover:bg-[#1a1f7a] text-white px-5 py-3 rounded-full text-sm font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer whitespace-nowrap self-start inline-block">
                  <i className="ri-rocket-line mr-2"></i>{currentLang === 'FR' ? "Commencer l'Aventure" : currentLang === 'EN' ? "Start the Adventure" : "Das Abenteuer beginnen"}
                </a>
              </div>
              <div className="flex items-center gap-6 pt-4">
                {[{ icon: 'ri-computer-line', value: currentLang === 'FR' ? '100% En ligne' : currentLang === 'EN' ? '100% Online' : '100% Online', color: 'text-emerald-500' }, { icon: 'ri-time-line', value: currentLang === 'FR' ? '1h / séance' : currentLang === 'EN' ? '1h / session' : '1h / Sitzung', color: 'text-[#232999]' }, { icon: 'ri-medal-line', value: currentLang === 'FR' ? 'Certificat de formation' : currentLang === 'EN' ? 'Training certificate' : 'Ausbildungszertifikat', color: 'text-amber-500' }].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <i className={`${item.icon} text-lg ${item.color}`}></i>
                    <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className={`relative rounded-3xl overflow-hidden shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-indigo-50'}`}>
                <picture>
                  <source srcSet="/home.webp" type="image/webp" />
                  <img src="/home.jpg" alt="Enfants apprenant la programmation Scratch en ligne, Smart Kids School Suisse" fetchPriority="high" className="w-full h-[480px] object-cover object-center" />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-[#232999]/15 to-transparent pointer-events-none"></div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white px-3 py-2 rounded-xl shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#232999] to-indigo-500 rounded-full flex items-center justify-center"><i className="ri-code-s-slash-line text-sm text-white"></i></div>
                  <div><p className="text-base font-bold text-gray-900 leading-none">100+</p><p className="text-[11px] text-gray-600">{t.studentsTrained}</p></div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white px-3 py-2 rounded-xl shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center"><i className="ri-trophy-line text-sm text-white"></i></div>
                  <div><p className="text-base font-bold text-gray-900 leading-none">98%</p><p className="text-[11px] text-gray-600">{t.satisfaction}</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip : Logos EPFL/ETHZ */}
      <section className={`py-6 px-4 border-y transition-colors duration-300 ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center gap-4">
            <p className={`text-sm uppercase tracking-widest font-semibold text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentLang === 'FR' ? 'Conçu par des ingénieurs diplômés' : currentLang === 'EN' ? 'Designed by graduate engineers from' : 'Konzipiert von Ingenieuren von'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-4">
              <img src="epfl.png" alt="EPFL, École Polytechnique Fédérale de Lausanne" loading="lazy" className={`h-16 md:h-20 w-auto transition-all ${darkMode ? 'invert' : ''}`} />
              <img src="ethz.png" alt="ETH Zürich, Eidgenössische Technische Hochschule Zürich" loading="lazy" className={`h-16 md:h-20 w-auto transition-all ${darkMode ? 'invert' : ''}`} />
            </div>
            <p className={`text-xs text-center max-w-xl ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {currentLang === 'FR'
                ? 'Une approche STEM (sciences, technologie, ingénierie et mathématiques) qui développe la logique et la créativité de votre enfant.'
                : currentLang === 'EN'
                ? 'A STEM approach (science, technology, engineering and mathematics) that builds your child\'s logic and creativity.'
                : 'Ein MINT-Ansatz (Mathematik, Informatik, Naturwissenschaft, Technik), der Logik und Kreativität Ihres Kindes fördert.'}
            </p>
          </div>
        </div>
      </section>
      {/* ── Benefits ── */}
      <section id="benefits" className={`py-20 px-4 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#232999] font-semibold text-sm uppercase tracking-wider">{t.whyChoose}</span>
            <h2 className={`text-4xl lg:text-5xl font-bold mt-4 mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.benefitsTitle}</h2>
            <p className={`text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.benefitsDesc}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { emoji: '💡', color: 'from-amber-400 to-orange-400', cardBg: 'from-amber-50 to-orange-50/50', cardBorder: 'border-amber-200/60', title: t.benefit1Title, desc: t.benefit1Desc },
              { emoji: '🧠', color: 'from-emerald-500 to-teal-500', cardBg: 'from-emerald-50 to-teal-50/50', cardBorder: 'border-emerald-200/60', title: t.benefit2Title, desc: t.benefit2Desc },
              { emoji: '🚀', color: 'from-[#232999] to-indigo-500', cardBg: 'from-indigo-50 to-blue-50/50', cardBorder: 'border-indigo-200/60', title: t.benefit6Title, desc: t.benefit6Desc },
              { emoji: '🏆', color: 'from-rose-400 to-pink-500', cardBg: 'from-rose-50 to-pink-50/50', cardBorder: 'border-rose-200/60', title: t.benefit4Title, desc: t.benefit4Desc },
            ].map((b, i) => (
              <div key={i} className={`group p-8 rounded-2xl border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${darkMode ? 'bg-gray-800 border-gray-700' : `bg-gradient-to-br ${b.cardBg} ${b.cardBorder}`}`}>
                <div className={`w-16 h-16 bg-gradient-to-br ${b.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 text-3xl shadow-md`}>
                  {b.emoji}
                </div>
                <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{b.title}</h3>
                <p className={`leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Du Débutant au Créateur (parcours progressif) */}
      <section id="parcours" className={`py-20 px-4 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#232999] font-semibold text-sm uppercase tracking-wider">
              {currentLang === 'FR' ? 'Programmation éducative' : currentLang === 'EN' ? 'Educational programming' : 'Pädagogisches Programmieren'}
            </span>
            <h2 className={`text-4xl lg:text-5xl font-bold mt-4 mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {currentLang === 'FR' ? 'Du Débutant au Créateur' : currentLang === 'EN' ? 'From Beginner to Creator' : 'Vom Anfänger zum Schöpfer'}
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentLang === 'FR'
                ? "De la première animation à la maîtrise de Python, un parcours progressif pensé pour grandir avec votre enfant, sur plusieurs années."
                : currentLang === 'EN'
                ? 'From the first animation to mastering Python, a progressive path designed to grow with your child, over several years.'
                : 'Von der ersten Animation bis zur Python-Beherrschung, ein progressiver Weg, der mit Ihrem Kind wächst.'}
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-12 left-12 right-12 h-1 bg-gradient-to-r from-emerald-400 via-sky-400 via-[#232999] to-amber-400 rounded-full"></div>
            <div className="grid lg:grid-cols-4 gap-8">
              {[
                { num: 1, level: 'Scratch', age: '6-9', icon: '🎨', color: 'from-emerald-400 to-teal-500',
                  label: currentLang === 'FR' ? 'Premiers pas créatifs' : currentLang === 'EN' ? 'First creative steps' : 'Erste kreative Schritte',
                  skills: currentLang === 'FR' ? 'Animations · Jeux simples · Logique visuelle' : currentLang === 'EN' ? 'Animations · Simple games · Visual logic' : 'Animationen · Einfache Spiele · Visuelle Logik' },
                { num: 2, level: 'Python Turtle', age: '8-11', icon: '🐢', color: 'from-sky-400 to-blue-500',
                  label: currentLang === 'FR' ? 'Le pont vers le vrai code' : currentLang === 'EN' ? 'The bridge to real code' : 'Die Brücke zum echten Code',
                  skills: currentLang === 'FR' ? 'Code visuel · Géométrie · Premiers algorithmes' : currentLang === 'EN' ? 'Visual code · Geometry · First algorithms' : 'Visueller Code · Geometrie · Erste Algorithmen' },
                { num: 3, level: 'Python', age: '10-14', icon: '🐍', color: 'from-[#232999] to-indigo-500',
                  label: currentLang === 'FR' ? 'Le langage de référence' : currentLang === 'EN' ? 'The reference language' : 'Die Referenzsprache',
                  skills: currentLang === 'FR' ? 'Programmation pure · Mini-projets · Algorithmique' : currentLang === 'EN' ? 'Pure programming · Mini-projects · Algorithmics' : 'Reine Programmierung · Mini-Projekte · Algorithmik' },
                { num: 4, level: 'IA · Web · Robotique', age: '12-15', icon: '🚀', color: 'from-amber-400 to-orange-500',
                  label: currentLang === 'FR' ? 'Spécialisations' : currentLang === 'EN' ? 'Specialisations' : 'Spezialisierungen',
                  skills: currentLang === 'FR' ? "Sites web · Mini-jeux · Robots virtuels" : currentLang === 'EN' ? 'Websites · Mini-games · Virtual robots' : 'Websites · Minispiele · Virtuelle Roboter' },
              ].map((stage, i) => (
                <div key={i} className="relative">
                  <div className={`relative z-10 mx-auto w-24 h-24 rounded-full bg-gradient-to-br ${stage.color} flex items-center justify-center text-4xl shadow-xl border-4 ${darkMode ? 'border-gray-900' : 'border-white'}`}>
                    {stage.icon}
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-7 h-7 bg-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-[#232999] z-20">
                    {stage.num}
                  </div>
                  <div className="text-center mt-6">
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stage.level}</h3>
                    <p className={`text-sm font-medium mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{stage.label}</p>
                    <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{stage.skills}</p>
                    <span className="inline-block mt-3 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                      ✓ {currentLang === 'FR' ? 'Disponible' : currentLang === 'EN' ? 'Available' : 'Verfügbar'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className={`text-center text-sm mt-12 max-w-2xl mx-auto italic ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            {currentLang === 'FR'
              ? "« Programmation éducative » signifie : pas seulement apprendre à coder, mais développer la pensée structurée, la créativité et la persévérance, des compétences transférables à toute la vie."
              : currentLang === 'EN'
              ? '"Educational programming" means: not just learning to code, but developing structured thinking, creativity and perseverance, life-transferable skills.'
              : '"Pädagogisches Programmieren" bedeutet: nicht nur Codieren lernen, sondern strukturiertes Denken, Kreativität und Ausdauer entwickeln.'}
          </p>

          {/* Exemples de projets concrets */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h3 className={`text-2xl lg:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentLang === 'FR' ? "Et ce n'est que le début" : currentLang === 'EN' ? "And that's just the beginning" : 'Und das ist erst der Anfang'}
              </h3>
              <p className={`mt-3 max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentLang === 'FR' ? "Des premiers jeux Scratch jusqu'à Python, aux mini-jeux, au robot virtuel et à l'intelligence artificielle : un parcours complet, étape par étape." : currentLang === 'EN' ? 'From first Scratch games to Python, mini-games, virtual robots and artificial intelligence: a complete journey, step by step.' : 'Von ersten Scratch-Spielen bis zu Python, Mini-Spielen, virtuellen Robotern und KI: ein kompletter Weg, Schritt für Schritt.'}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { emoji: '🎮', title: currentLang === 'FR' ? 'Jeu d\'arcade interactif' : currentLang === 'EN' ? 'Interactive arcade game' : 'Interaktives Arcade-Spiel',
                  desc: currentLang === 'FR' ? 'Personnages, ennemis, scores et écran de victoire, un vrai jeu jouable.' : currentLang === 'EN' ? 'Characters, enemies, scores and win screen, a real playable game.' : 'Charaktere, Feinde, Punktestände, ein echtes Spiel.',
                  tags: currentLang === 'FR' ? ['Scratch', 'Boucles & conditions', 'Variables'] : currentLang === 'EN' ? ['Scratch', 'Loops & conditions', 'Variables'] : ['Scratch', 'Schleifen & Bedingungen', 'Variablen'] },
                { emoji: '🎯', title: currentLang === 'FR' ? 'Mini-jeu en Python' : currentLang === 'EN' ? 'Python mini-game' : 'Python-Minispiel',
                  desc: currentLang === 'FR' ? 'Devinette de nombre, pierre-feuille-ciseaux ou quiz personnalisé.' : currentLang === 'EN' ? 'Number guessing, rock-paper-scissors or custom quiz.' : 'Zahlenraten, Schere-Stein-Papier oder Quiz.',
                  tags: currentLang === 'FR' ? ['Python', 'Logique & aléatoire', 'Entrées / sorties'] : currentLang === 'EN' ? ['Python', 'Logic & randomness', 'Input / output'] : ['Python', 'Logik & Zufall', 'Ein- / Ausgabe'] },
                { emoji: '🌐', title: currentLang === 'FR' ? 'Site web personnel' : currentLang === 'EN' ? 'Personal website' : 'Persönliche Website',
                  desc: currentLang === 'FR' ? "Sa première page web, avec ses textes, ses images et ses liens, publiée en ligne." : currentLang === 'EN' ? 'Their first web page, with text, images and links, published online.' : 'Die erste Webseite, mit Texten, Bildern und Links, online veröffentlicht.',
                  tags: currentLang === 'FR' ? ['HTML & CSS', 'Structure d\'une page', 'Mise en ligne'] : currentLang === 'EN' ? ['HTML & CSS', 'Page structure', 'Going live'] : ['HTML & CSS', 'Seitenstruktur', 'Veröffentlichung'] },
              ].map((proj, i) => (
                <div key={i} className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'}`}>
                  <div className="text-4xl mb-3">{proj.emoji}</div>
                  <h4 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{proj.title}</h4>
                  <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{proj.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {proj.tags.map((tag, j) => (
                      <span key={j} className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${darkMode ? 'bg-indigo-900/40 text-indigo-300' : 'bg-indigo-50 text-[#232999]'}`}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <a href="#realisations" className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-[#232999] hover:text-indigo-800'}`}>
                {currentLang === 'FR' ? 'Voir les créations de nos élèves' : currentLang === 'EN' ? 'See our students\' creations' : 'Projekte unserer Schüler ansehen'}
                <i className="ri-arrow-down-line"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pourquoi Scratch + Vidéo ── */}
      <section id="scratch" className={`py-20 px-4 transition-colors duration-300 ${darkMode ? 'bg-gray-950' : 'bg-gradient-to-br from-indigo-50/40 via-slate-50 to-indigo-50/40'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#232999] font-semibold text-sm uppercase tracking-wider">
              {currentLang === 'FR' ? 'Notre point de départ' : currentLang === 'EN' ? 'Our starting point' : 'Unser Ausgangspunkt'}
            </span>
            <h2 className={`text-3xl lg:text-4xl font-bold mt-4 mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.scratchTitle}
            </h2>
            <p className={`text-lg max-w-3xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentLang === 'FR'
                ? "Avant le vrai code, nous commençons par Scratch, un environnement créé par le MIT pour donner aux enfants le bon réflexe de programmation, sans la barrière du clavier."
                : currentLang === 'EN'
                ? "Before real code, we start with Scratch, an environment created by MIT to give children the right programming reflex, without the keyboard barrier."
                : 'Vor dem echten Code beginnen wir mit Scratch, einer vom MIT entwickelten Umgebung, die Kindern den richtigen Programmierreflex vermittelt.'}
            </p>
          </div>

          <div className={`rounded-3xl p-8 lg:p-12 ${darkMode ? 'bg-gray-800' : 'bg-white shadow-lg border border-gray-100'}`}>
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="space-y-4">
                  {[
                    { title: t.scratch1Title, desc: t.scratch1Desc, color: 'from-[#232999] to-indigo-500' },
                    { title: t.scratch2Title, desc: t.scratch2Desc, color: 'from-emerald-500 to-teal-500' },
                    { title: t.scratch3Title, desc: t.scratch3Desc, color: 'from-amber-500 to-orange-500' },
                    { title: t.scratch4Title, desc: t.scratch4Desc, color: 'from-rose-500 to-pink-500' },
                  ].map((p, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 bg-gradient-to-br ${p.color} rounded-lg flex items-center justify-center`}>
                        <i className="ri-check-line text-white text-lg"></i>
                      </div>
                      <div>
                        <h4 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{p.title}</h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 to-slate-50'}`}>
                  {/* ── VIDEO démo : fichier MP4 local, lecteur natif ── */}
                  <div
                    className="aspect-video bg-gray-900 rounded-xl mb-4 relative"
                    style={{ overflow: 'hidden' }}
                  >
                    <video
                      controls
                      preload="none"
                      poster="/videos/posters/Scratch 4.jpg"
                      playsInline
                      controlsList="nodownload"
                      className="w-full h-full object-cover bg-gray-900"
                      title="Projet d'élève, Smart Kids School"
                    >
                      <source src="/videos/Scratch 4.mp4" type="video/mp4" />
                    </video>
                  </div>
                  <h4 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.exampleProject}</h4>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.exampleProjectDesc}</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="bg-indigo-100 text-[#232999] px-3 py-1 rounded-full text-xs font-medium">{currentLang === 'FR' ? 'Jeux' : currentLang === 'EN' ? 'Games' : 'Spiele'}</span>
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">Animations</span>
                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium">{currentLang === 'FR' ? 'Histoires' : currentLang === 'EN' ? 'Stories' : 'Geschichten'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Galerie de projets d'élèves (preuve sociale) ── */}
      <section id="realisations" className={`py-20 px-4 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#232999] font-semibold text-sm uppercase tracking-wider">
              {currentLang === 'FR' ? 'Réalisé par nos élèves' : currentLang === 'EN' ? 'Made by our students' : 'Von unseren Schülern erstellt'}
            </span>
            <h2 className={`text-4xl lg:text-5xl font-bold mt-3 mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {currentLang === 'FR' ? 'Leurs premiers jeux vidéo' : currentLang === 'EN' ? 'Their first video games' : 'Ihre ersten Videospiele'}
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentLang === 'FR'
                ? "Des projets réels, créés de A à Z par nos apprenti-développeurs. Voilà ce que votre enfant peut construire."
                : currentLang === 'EN'
                ? 'Real projects, built from scratch by our junior developers. This is what your child can create.'
                : 'Echte Projekte, von unseren Nachwuchs-Entwicklern erstellt. Das kann Ihr Kind bauen.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'Jonas', age: 8, file: 'Scratch 1', city: 'Lausanne', course: 'Scratch Basics', date: 'Mars 2025' },
              { name: 'Emma', age: 11, file: 'Scratch 2', city: 'Genève', course: 'Advanced Scratch', date: 'Juin 2025' },
              { name: 'Alex', age: 12, file: 'Scratch 3', city: 'Morges', course: 'Advanced Scratch', date: 'Nov. 2025' },
              { name: 'Victor', age: 13, file: 'Scratch 4', city: 'Nyon', course: 'Advanced Scratch', date: 'Févr. 2026' },
              { name: 'Valentin', age: 14, file: 'Python Turtle 1', city: 'Lausanne', course: 'Python Turtle', date: 'Mars 2026' },
              { name: 'Nadine', age: 14, file: 'Python Turtle 2', city: 'Genève', course: 'Python Turtle', date: 'Mai 2026' },
            ].map((s, i) => (
              <div key={i} className={`rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="aspect-video bg-gray-900 relative" style={{ overflow: 'hidden' }}>
                  <video
                    controls
                    preload="none"
                    poster={`/videos/posters/${s.file}.jpg`}
                    playsInline
                    controlsList="nodownload"
                    className="w-full h-full object-cover bg-gray-900"
                    title={`Projet de ${s.name}`}
                  >
                    <source src={`/videos/${s.file}.mp4`} type="video/mp4" />
                  </video>
                </div>
                <div className="p-4 text-center">
                  <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {s.name}, {s.age} {currentLang === 'FR' ? 'ans' : currentLang === 'EN' ? 'y/o' : 'J.'}
                  </p>
                  <p className="text-sm font-semibold text-[#232999] mt-0.5">{s.course}</p>
                  <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{s.city} · {s.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Témoignages de parents (preuve sociale, défilement continu) ──
           Les 6 avis défilent en boucle sur une seule rangée. Pause au survol.
           Pour ajouter un avis : compléter les 3 listes (FR/EN/DE) ci-dessous. */}
      <section id="avis" className={`py-20 transition-colors duration-300 ${darkMode ? 'bg-gray-950' : 'bg-gradient-to-br from-indigo-50/50 to-white'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 px-4">
            <span className="text-[#232999] font-semibold text-sm uppercase tracking-wider">
              {currentLang === 'FR' ? 'Ils nous font confiance' : currentLang === 'EN' ? 'They trust us' : 'Sie vertrauen uns'}
            </span>
            <h2 className={`text-4xl lg:text-5xl font-bold mt-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {currentLang === 'FR' ? 'Ce que disent les parents' : currentLang === 'EN' ? 'What parents say' : 'Was Eltern sagen'}
            </h2>
          </div>

          <style>{`
            @keyframes sks-reviews-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
            .sks-reviews-track { animation: sks-reviews-scroll 55s linear infinite; }
            .sks-reviews-track:hover { animation-play-state: paused; }
            @media (prefers-reduced-motion: reduce) { .sks-reviews-track { animation: none; flex-wrap: wrap; justify-content: center; } }
          `}</style>
          <div className="relative overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)' }}>
            <div className="sks-reviews-track flex gap-6 w-max py-2">
              {(() => {
                const reviews = currentLang === 'FR' ? [
                  { text: "Mon fils a créé son premier jeu vidéo en seulement quelques semaines. Il en est très fier et continue à programmer avec plaisir à la maison.", author: "Parent d'élève", detail: "Maman de Jonas, 8 ans · Lausanne" },
                  { text: "Emma attend son cours chaque semaine avec impatience. L'enseignement est de grande qualité et le suivi est vraiment personnalisé.", author: "Parent d'élève", detail: "Papa d'Emma, 11 ans · Genève" },
                  { text: "J'apprécie surtout que le programme soit adapté aux enfants. Il progresse à son rythme, sans se décourager, et a gagné en autonomie.", author: "Parent d'élève", detail: "Maman de Victor, 13 ans · Morges" },
                  { text: "Mes deux filles attendent leur séance chez Smart Kids School avec impatience chaque semaine. C'est une activité qui les stimule et leur donne envie d'apprendre.", author: "Parent d'élève", detail: "Maman de Myriam (12 ans) et Jasmin (10 ans) · Fribourg" },
                  { text: "Lorenzo passe maintenant plus de temps à coder et à améliorer ses projets sur Scratch. Son enseignant sait vraiment le motiver et lui donne toujours envie d'aller plus loin.", author: "Parent d'élève", detail: "Maman de Lorenzo, 13 ans · Lausanne" },
                  { text: "J'aurais aimé inscrire Nadia plus tôt à ces stages. Elle a pris confiance en elle, développe sa créativité et attend déjà le prochain avec impatience.", author: "Parent d'élève", detail: "Maman de Nadia, 14 ans · Genève" },
                ] : currentLang === 'EN' ? [
                  { text: "My son created his first video game in just a few weeks. He's very proud and keeps coding for fun at home.", author: "Parent", detail: "Jonas's mum, 8 · Lausanne" },
                  { text: "Emma looks forward to her lesson every week. The teaching is high quality and the follow-up is truly personalised.", author: "Parent", detail: "Emma's dad, 11 · Geneva" },
                  { text: "What I appreciate most is that the programme is designed for kids. He progresses at his own pace, without getting discouraged, and has gained independence.", author: "Parent", detail: "Victor's mum, 13 · Morges" },
                  { text: "Both my daughters look forward to their Smart Kids School session every week. It's an activity that stimulates them and makes them want to learn.", author: "Parent", detail: "Mum of Myriam (12) and Jasmin (10) · Fribourg" },
                  { text: "Lorenzo now spends more time coding and improving his Scratch projects. His teacher really knows how to motivate him and always makes him want to go further.", author: "Parent", detail: "Lorenzo's mum, 13 · Lausanne" },
                  { text: "I wish I had signed Nadia up for these camps sooner. She has gained confidence, is developing her creativity, and is already looking forward to the next one.", author: "Parent", detail: "Nadia's mum, 14 · Geneva" },
                ] : [
                  { text: "Mein Sohn hat in nur wenigen Wochen sein erstes Videospiel erstellt. Er ist sehr stolz und programmiert zu Hause weiter, mit Freude.", author: "Elternteil", detail: "Jonas' Mutter, 8 · Lausanne" },
                  { text: "Emma freut sich jede Woche auf ihren Kurs. Der Unterricht ist hochwertig und die Begleitung wirklich persönlich.", author: "Elternteil", detail: "Emmas Vater, 11 · Genf" },
                  { text: "Was ich am meisten schätze: Das Programm ist für Kinder gemacht. Er macht Fortschritte in seinem eigenen Tempo, ohne den Mut zu verlieren, und ist selbstständiger geworden.", author: "Elternteil", detail: "Victors Mutter, 13 · Morges" },
                  { text: "Meine beiden Töchter freuen sich jede Woche auf ihre Sitzung bei Smart Kids School. Eine Aktivität, die sie anregt und Lust aufs Lernen macht.", author: "Elternteil", detail: "Mutter von Myriam (12) und Jasmin (10) · Freiburg" },
                  { text: "Lorenzo verbringt jetzt mehr Zeit damit, zu programmieren und seine Scratch-Projekte zu verbessern. Sein Lehrer weiss ihn wirklich zu motivieren.", author: "Elternteil", detail: "Lorenzos Mutter, 13 · Lausanne" },
                  { text: "Ich hätte Nadia früher für diese Camps anmelden sollen. Sie hat Selbstvertrauen gewonnen, entwickelt ihre Kreativität und freut sich schon aufs nächste.", author: "Elternteil", detail: "Nadias Mutter, 14 · Genf" },
                ];
                // Liste doublée pour un défilement en boucle sans coupure
                return [...reviews, ...reviews].map((r, i) => (
                  <div key={i} className={`w-[320px] sm:w-[360px] flex-shrink-0 rounded-2xl p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
                    <div className="text-amber-400 text-lg mb-3">★★★★★</div>
                    <p className={`text-sm leading-relaxed mb-4 italic ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>“{r.text}”</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#232999] text-white flex items-center justify-center font-bold flex-shrink-0">
                        {r.detail.charAt(0)}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{r.author}</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{r.detail}</p>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA vers /tarifs ── */}
      <section id="pricing" className={`py-16 px-4 transition-colors duration-300 ${darkMode ? 'bg-gray-950' : 'bg-gradient-to-br from-indigo-50/40 via-white to-indigo-50/40'}`}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {currentLang === 'FR' ? 'Prêt à inscrire votre enfant ?' : currentLang === 'EN' ? 'Ready to enroll your child?' : 'Bereit, Ihr Kind anzumelden?'}
          </h2>
          <p className={`text-lg mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {currentLang === 'FR'
              ? "Découvrez nos formules d'abonnement adaptées à chaque famille, individuel ou en duo (frère, sœur, ami)."
              : currentLang === 'EN'
              ? 'Discover our subscription plans tailored to every family, solo or duo (sibling, friend).'
              : 'Entdecken Sie unsere Abos für jede Familie, Solo oder Duo (Geschwister, Freund).'}
          </p>
          <a href={lp('/tarifs')} className="inline-flex items-center gap-2 bg-[#232999] hover:bg-[#1a1f7a] text-white px-8 py-4 rounded-full font-bold transition-all hover:shadow-xl hover:scale-105">
            {currentLang === 'FR' ? 'Voir nos formules' : currentLang === 'EN' ? 'See our plans' : 'Unsere Angebote ansehen'} →
          </a>
        </div>
      </section>

      {/* ── Pourquoi nous avons créé SKS ── */}
      <section className={`py-20 px-4 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#232999] font-semibold text-sm uppercase tracking-wider">
              {currentLang === 'FR' ? 'Notre histoire' : currentLang === 'EN' ? 'Our story' : 'Unsere Geschichte'}
            </span>
            <h2 className={`text-4xl lg:text-5xl font-bold mt-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {currentLang === 'FR' ? 'Pourquoi nous avons créé SKS' : currentLang === 'EN' ? 'Why we created SKS' : 'Warum wir SKS gegründet haben'}
            </h2>
          </div>
          <div className={`rounded-3xl p-10 md:p-14 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-indigo-50/60 via-white to-amber-50/40 border-gray-200 shadow-lg'}`}>
            <div className="text-6xl mb-6 text-center">💡</div>
            <p className={`text-xl leading-relaxed text-center font-light italic mb-6 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              {currentLang === 'FR'
                ? "« Smart Kids School, ce sont les cours que nous donnons à nos propres enfants, ceux que nous aurions aimé avoir nous-mêmes, étant enfants à cette ère digitale. »"
                : currentLang === 'EN'
                ? "« Smart Kids School is the school we built for our own children, the classes we wished we'd had ourselves, as kids in this digital age. »"
                : "« Smart Kids School ist die Schule, die wir für unsere eigenen Kinder gebaut haben, die Kurse, die wir selbst als Kinder im digitalen Zeitalter gerne gehabt hätten. »"}
            </p>
            <div className={`prose max-w-none text-base leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p className="mb-4">
                {currentLang === 'FR'
                  ? "Nous avons grandi avec les premiers ordinateurs, sans personne pour nous expliquer comment ils fonctionnaient vraiment. Devenus ingénieurs à l'EPFL et à l'ETHZ, nous avons mis des années à apprendre ce qu'on aurait pu nous transmettre dès l'enfance."
                  : currentLang === 'EN'
                  ? "We grew up with the first computers, without anyone to explain how they really worked. After becoming engineers at EPFL and ETHZ, we spent years learning what could have been taught to us as children."
                  : "Wir sind mit den ersten Computern aufgewachsen, ohne dass uns jemand erklärt hätte, wie sie wirklich funktionieren. Als Ingenieure an EPFL und ETHZ haben wir Jahre gebraucht, um zu lernen, was uns schon als Kinder hätte beigebracht werden können."}
              </p>
              <p>
                {currentLang === 'FR'
                  ? "Aujourd'hui, l'IA, le code et la robotique transforment tous les métiers. Nos enfants vivront dans un monde où ces compétences ne seront plus optionnelles. SKS existe pour leur donner l'avance que nous n'avons pas eue, avec patience, bienveillance, et la rigueur d'une formation conçue par ceux qui pratiquent ces métiers tous les jours."
                  : currentLang === 'EN'
                  ? "Today, AI, code and robotics are transforming every profession. Our children will live in a world where these skills are no longer optional. SKS exists to give them the head start we never had, with patience, care, and the rigor of training designed by those who practice these professions every day."
                  : "Heute verändern KI, Code und Robotik jeden Beruf. Unsere Kinder werden in einer Welt leben, in der diese Fähigkeiten nicht mehr optional sind. SKS existiert, um ihnen den Vorsprung zu geben, den wir nicht hatten, mit Geduld, Sorgfalt und der Strenge einer Ausbildung, die von denjenigen entwickelt wurde, die diese Berufe täglich ausüben."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comment ça se passe en ligne ── */}
      <section id="deroulement" className={`py-20 px-4 transition-colors duration-300 ${darkMode ? 'bg-gray-950' : 'bg-gradient-to-br from-slate-50 to-white'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#232999] font-semibold text-sm uppercase tracking-wider">
              {currentLang === 'FR' ? 'Cours en ligne' : currentLang === 'EN' ? 'Online classes' : 'Online-Unterricht'}
            </span>
            <h2 className={`text-4xl lg:text-5xl font-bold mt-4 mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {currentLang === 'FR' ? 'Comment ça se passe concrètement ?' : currentLang === 'EN' ? 'How does it actually work?' : 'Wie läuft es konkret ab?'}
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentLang === 'FR' ? "Une expérience pensée pour rassurer les parents et passionner les enfants." : currentLang === 'EN' ? 'An experience designed to reassure parents and excite children.' : 'Eine Erfahrung, die Eltern beruhigt und Kinder begeistert.'}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '💻', title: currentLang === 'FR' ? 'Visioconférence dédiée' : currentLang === 'EN' ? 'Dedicated video call' : 'Eigene Videokonferenz',
                desc: currentLang === 'FR' ? "Votre enfant rejoint un cours en visio avec son professeur, pas de salle d'attente, pas de partage avec d'autres groupes." : currentLang === 'EN' ? 'Your child joins a video call with their teacher, no waiting room, no sharing with other groups.' : 'Ihr Kind tritt einer Videokonferenz mit der Lehrperson bei, kein Wartezimmer.' },
              { icon: '🖥️', title: currentLang === 'FR' ? "Partage d'écran en direct" : currentLang === 'EN' ? 'Live screen sharing' : 'Live-Bildschirmfreigabe',
                desc: currentLang === 'FR' ? "Le professeur voit ce que fait votre enfant en temps réel et peut l'aider, le corriger, l'encourager." : currentLang === 'EN' ? 'The teacher sees what your child does in real time and can help, correct, encourage.' : 'Die Lehrperson sieht in Echtzeit und kann helfen, korrigieren, ermutigen.' },
              { icon: '🛡️', title: currentLang === 'FR' ? 'Garantie 1ère séance' : currentLang === 'EN' ? '1st session guarantee' : '1. Sitzung Garantie',
                desc: currentLang === 'FR' ? 'Pas convaincu après la première séance ? Remboursement intégral, sans question.' : currentLang === 'EN' ? "Not convinced after the first session? Full refund, no questions asked." : 'Nicht überzeugt nach der ersten Sitzung? Volle Rückerstattung.' },
            ].map((item, i) => (
              <div key={i} className={`p-8 rounded-2xl border text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.title}</h3>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className={`py-20 px-4 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#232999] font-semibold text-sm uppercase tracking-wider">{t.faqLabel}</span>
            <h2 className={`text-4xl lg:text-5xl font-bold mt-4 mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.faqTitle}</h2>
            <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.faqDesc}</p>
          </div>
          <div className="space-y-4">
            {[
              { q: t.faq1Q, a: t.faq1A },
              { q: t.faq2Q, a: t.faq2A },
              { q: t.faq3Q, a: t.faq3A },
              { q: t.faq4Q, a: t.faq4A },
              { q: t.faq5Q, a: t.faq5A },
              { q: t.faq6Q, a: t.faq6A },
              { q: t.faq7Q, a: t.faq7A },
              { q: t.faq8Q, a: t.faq8A },
            ].map((faq, index) => (
              <div key={index} className={`border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'}`}>
                <button onClick={() => toggleFaq(index)} className="w-full px-8 py-6 text-left flex items-center justify-between gap-4 cursor-pointer">
                  <h3 className={`text-lg font-bold pr-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{faq.q}</h3>
                  <i className={`ri-${openFaq === index ? 'subtract' : 'add'}-line text-2xl text-[#232999] flex-shrink-0`}></i>
                </button>
                {openFaq === index && <div className="px-8 pb-6"><p className={`leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{faq.a}</p></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className={`py-20 px-4 transition-colors duration-300 ${darkMode ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.contactTitle}</h2>
            <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.contactDesc}</p>
          </div>
          <form onSubmit={handleContactSubmit} name="contact" data-netlify="true" className={`p-8 rounded-3xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'}`} id="contact-form">
            <input type="hidden" name="form-name" value="contact" />
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.fullName}</label>
                <input type="text" name="name" value={contactFormData.name} onChange={e => setContactFormData({ ...contactFormData, name: e.target.value })} required className={`w-full px-4 py-3 rounded-xl border focus:border-[#232999] focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`} placeholder={t.fullName} />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                <input type="email" name="email" value={contactFormData.email} onChange={e => setContactFormData({ ...contactFormData, email: e.target.value })} required className={`w-full px-4 py-3 rounded-xl border focus:border-[#232999] focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`} placeholder="votre@email.com" />
              </div>
            </div>
            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.phoneOptional}</label>
              <input type="tel" name="phone" value={contactFormData.phone} onChange={e => setContactFormData({ ...contactFormData, phone: e.target.value })} className={`w-full px-4 py-3 rounded-xl border focus:border-[#232999] focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`} placeholder="+41 XX XXX XX XX" />
            </div>
            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.message}</label>
              <textarea name="message" value={contactFormData.message} onChange={e => setContactFormData({ ...contactFormData, message: e.target.value })} required maxLength={500} rows={5} className={`w-full px-4 py-3 rounded-xl border focus:border-[#232999] focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`} placeholder={t.messagePlaceholder}></textarea>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{contactFormData.message.length}/500</p>
            </div>
            {submitMessage && <div className={`mb-6 p-4 rounded-xl ${submitMessage.includes('Merci') || submitMessage.includes('Thank') || submitMessage.includes('Danke') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{submitMessage}</div>}
            <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-[#232999] to-indigo-600 text-white px-8 py-4 rounded-full text-base font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 cursor-pointer whitespace-nowrap">
              {isSubmitting ? t.sending : t.sendMessage}
            </button>
          </form>
        </div>
      </section>

      {/* ── Footer ── */}
      <Footer currentLang={currentLang} darkMode={darkMode} />

      {/* ── WhatsApp Floating Button (compact, style Stripe/Apple) ── */}
      <a
        href="https://wa.me/41774768492"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-full shadow-xl hover:shadow-green-400/50 transition-all duration-300 hover:scale-110 group"
        title={currentLang === 'FR' ? 'Nous contacter sur WhatsApp' : currentLang === 'EN' ? 'Contact us on WhatsApp' : 'Kontaktieren Sie uns auf WhatsApp'}
        aria-label={currentLang === 'FR' ? 'Contacter sur WhatsApp' : 'Contact WhatsApp'}
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

      {/* ── Cookie Banner (mini, style Stripe) ── */}
      {cookieConsent === 'pending' && (
        <div className="fixed bottom-4 left-4 right-4 md:right-auto md:max-w-md z-50">
          <div className={`rounded-2xl shadow-2xl border p-4 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`} style={{ animation: 'cookie-slide-in 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <style>{`
              @keyframes cookie-slide-in {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            {!showCookieDetails ? (
              // Version compacte (par défaut)
              <div className="flex flex-col gap-3">
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  🍪 {currentLang === 'FR' ? 'Nous utilisons des cookies pour améliorer votre expérience.' : currentLang === 'EN' ? 'We use cookies to improve your experience.' : 'Wir verwenden Cookies, um Ihre Erfahrung zu verbessern.'}{' '}
                  <button
                    onClick={() => setShowCookieDetails(true)}
                    className={`underline font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-[#232999] hover:text-[#1a1f7a]'}`}
                  >
                    {currentLang === 'FR' ? "Plus d'infos" : currentLang === 'EN' ? 'Learn more' : 'Mehr erfahren'}
                  </button>
                </p>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => acceptCookies({ stats: true, marketing: false })}
                    className="flex-1 bg-[#232999] hover:bg-[#1a1f7a] text-white px-4 py-2 rounded-full text-sm font-semibold transition-all hover:shadow-lg whitespace-nowrap"
                  >
                    {t.cookieAccept}
                  </button>
                  <button
                    onClick={refuseCookies}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {t.cookieRefuse}
                  </button>
                </div>
              </div>
            ) : (
              // Version détaillée (si l'utilisateur clique "Plus d'infos")
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.cookieTitle}</h3>
                  <button
                    onClick={() => setShowCookieDetails(false)}
                    className={`p-1 rounded-full hover:bg-gray-100 ${darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500'}`}
                    aria-label="Fermer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
                <p className={`text-xs mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.cookieDesc}</p>
                <div className="space-y-2 mb-3">
                  {[
                    { label: t.cookieFunctional, desc: t.cookieFunctionalDesc, alwaysOn: true },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-start justify-between gap-3 p-2.5 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <div>
                        <p className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.label}</p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 whitespace-nowrap flex-shrink-0">{t.cookieAlwaysActive}</span>
                    </div>
                  ))}
                  {[
                    { label: t.cookieStats, desc: t.cookieStatsDesc, key: 'stats' as const },
                    { label: t.cookieMarketing, desc: t.cookieMarketingDesc, key: 'marketing' as const },
                  ].map((item) => (
                    <div key={item.key} className={`flex items-start justify-between gap-3 p-2.5 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <div>
                        <p className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.label}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCookiePrefs(p => ({ ...p, [item.key]: !p[item.key] }))}
                        className={`relative flex-shrink-0 mt-0.5 w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer focus:outline-none ${cookiePrefs[item.key] ? 'bg-[#232999]' : darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
                        aria-checked={cookiePrefs[item.key]}
                        role="switch"
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${cookiePrefs[item.key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptCookies(cookiePrefs)}
                    className="flex-1 bg-[#232999] hover:bg-[#1a1f7a] text-white px-4 py-2 rounded-full text-sm font-semibold transition-all"
                  >
                    {currentLang === 'FR' ? 'Confirmer' : currentLang === 'EN' ? 'Confirm' : 'Bestätigen'}
                  </button>
                  <button
                    onClick={refuseCookies}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {t.cookieRefuse}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}