import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import CookieBanner from '../components/CookieBanner';
import { parseLocaleFromPath, localizedPath, setHreflangTags } from '../i18n/routing';

type Lang = 'FR' | 'EN' | 'DE';
type Category = 'general' | 'pricing' | 'stages';

interface FaqItem {
  q: string;
  a: string;
}

const T: Record<Lang, {
  pageTitle: string;
  pageSubtitle: string;
  searchPlaceholder: string;
  catGeneral: string;
  catPricing: string;
  catStages: string;
  catGeneralDesc: string;
  catPricingDesc: string;
  catStagesDesc: string;
  ctaTitle: string;
  ctaDesc: string;
  ctaContact: string;
  ctaWhatsapp: string;
  noResults: string;
  navHome: string;
  navProgramme: string;
  navTarifs: string;
  navPremium: string;
  navStages: string;
  navFaq: string;
  navBlog: string;
  navEnroll: string;
  general: FaqItem[];
  pricing: FaqItem[];
  stages: FaqItem[];
}> = {
  FR: {
    pageTitle: 'Questions fréquentes',
    pageSubtitle: 'Tout ce que vous devez savoir avant d\'inscrire votre enfant. Si vous ne trouvez pas votre réponse, écrivez-nous, on répond rapidement.',
    searchPlaceholder: 'Rechercher une question...',
    catGeneral: 'Général',
    catPricing: 'Tarifs & Abonnements',
    catStages: 'Stages vacances',
    catGeneralDesc: 'Sur les cours, le matériel et le déroulement.',
    catPricingDesc: 'Sur nos formules Solo et Duo, et les engagements.',
    catStagesDesc: 'Sur les stages pendant les vacances scolaires.',
    ctaTitle: 'Vous ne trouvez pas votre réponse ?',
    ctaDesc: "Notre équipe répond généralement en moins de 24h.",
    ctaContact: 'Nous écrire',
    ctaWhatsapp: 'WhatsApp',
    noResults: 'Aucune question ne correspond à votre recherche.',
    navHome: 'Accueil', navProgramme: 'Programme', navTarifs: 'Tarifs', navPremium: 'Premium', navStages: 'Stages', navFaq: 'FAQ', navBlog: 'Blog', navEnroll: 'Inscrire mon enfant',
    general: [
      { q: "À quels horaires les cours ont-ils lieu ?", a: "Vous choisissez : nous sommes ouverts de 9h à 19h et fixons ensemble le créneau qui vous convient (après l'école, le mercredi, le week-end). Le rythme aussi s'adapte à votre enfant, c'est tout l'intérêt d'un cours personnalisé." },
      { q: "Mon enfant n'a aucune expérience en programmation. Est-ce un problème ?", a: "Absolument pas ! Nos cours sont spécialement conçus pour les débutants complets. Nous commençons par les bases et progressons à un rythme adapté à chaque enfant. Aucun prérequis n'est nécessaire." },
      { q: "Quel matériel est nécessaire pour suivre les cours ?", a: "Votre enfant aura besoin d'un ordinateur (PC, Mac ou Chromebook) avec une connexion internet stable, un casque ou écouteurs, et idéalement une webcam. Tout se fait dans le navigateur, aucune installation complexe n'est requise." },
      { q: "Comment se déroulent les séances en ligne ?", a: "Les séances se déroulent en visioconférence avec un enseignant dédié. Votre enfant peut voir l'écran de l'enseignant, poser des questions en direct et partager son propre écran pour recevoir de l'aide personnalisée. Les séances durent 1h." },
      { q: "À partir de quel âge peut-on commencer ?", a: "Nous accueillons les enfants à partir de 7 ans. Le contenu est adapté à chaque tranche d'âge, les plus jeunes commencent avec Scratch, et progressent ensuite vers Python et au-delà." },
      { q: "Qui anime les cours ?", a: "Nos cours sont animés par des enseignants formés à notre méthode pédagogique, conçue par des ingénieurs EPFL et ETHZ. Tous nos enseignants partagent la même passion : transmettre la programmation avec patience et bienveillance." },
      { q: "Que se passe-t-il si mon enfant manque une séance ?", a: "Les séances peuvent être reprogrammées avec un préavis de 24h. Nous fournissons aussi un résumé des notions vues et des exercices pour rattraper le contenu si besoin." },
      { q: "Y a-t-il un certificat à la fin du parcours ?", a: "Oui, chaque enfant reçoit un certificat de formation reconnaissant les compétences acquises et les projets réalisés." },
      { q: "Puis-je assister aux séances avec mon enfant ?", a: "Pour les plus jeunes (7-9 ans), nous encourageons la présence d'un parent à proximité pour l'assistance technique si nécessaire. Les enfants plus âgés suivent généralement de manière autonome." },
    ],
    pricing: [
      { q: "Comment fonctionnent les formules Solo et Duo ?", a: "L'enfant peut suivre le cours en Solo (cours individuel) ou en Duo avec un frère, une sœur ou un ami. Les tarifs les plus avantageux, soit 249 CHF/mois en Solo et 169 CHF/mois par enfant en Duo, correspondent à l'engagement 12 mois, qui couvre le programme de base de programmation éducative avant la spécialisation. Le tarif baisse en Duo car le cours est mutualisé. Pour 3 enfants ou plus, contactez-nous pour un devis sur-mesure." },
      { q: "Quelle est la différence entre les engagements 3, 6 et 12 mois ?", a: "Plus l'engagement est long, plus le tarif mensuel baisse (jusqu'à -17% sur 12 mois). L'engagement minimum est de 3 mois (la durée d'un module complet) pour que votre enfant aille au bout de son apprentissage. Tous les engagements incluent les mêmes contenus et la garantie 1ère séance." },
      { q: "Que comprend la 'Garantie 1ère séance' ?", a: "Si après la première séance vous n'êtes pas convaincu, nous vous remboursons intégralement, sans poser de question. C'est notre engagement pour que vous testiez sans risque." },
      { q: "Et si je veux changer de niveau d'engagement ?", a: "Vous pouvez à tout moment passer à un engagement plus long (par exemple de 3 à 6 ou 12 mois) pour bénéficier d'un tarif plus avantageux. Le sens inverse n'est pas possible avant la fin de la période d'engagement souscrite." },
      { q: "Quels moyens de paiement acceptez-vous ?", a: "Carte bancaire (Visa, Mastercard, Apple Pay, Google Pay), virement bancaire, et paiement en plusieurs fois. Tous les paiements sont sécurisés via Stripe." },
      { q: "Puis-je annuler mon abonnement ?", a: "L'abonnement court jusqu'à la fin de la période choisie (3, 6 ou 12 mois), puis se renouvelle automatiquement et reste annulable à tout moment ensuite." },
      { q: "Y a-t-il des frais cachés ?", a: "Non. Le prix affiché est tout compris : cours, plateforme, certificat, ressources. Aucun frais d'inscription, aucune surprise." },
    ],
    stages: [
      { q: "Combien de temps durent les stages ?", a: "Les stages durent une semaine, à raison de 4 demi-journées (matin OU après-midi, au choix). Chaque demi-journée fait 3 heures." },
      { q: "Quels sont les thèmes proposés ?", a: "Trois thèmes au choix selon les périodes : 'Crée ton premier jeu vidéo' (Scratch), Python Turtle (introduction au code), et Python pur (programmation avancée)." },
      { q: "À partir de quel âge peut-on participer aux stages ?", a: "Les stages sont ouverts dès 7 ans. Les groupes sont constitués par tranches d'âge proches pour garantir une dynamique adaptée." },
      { q: "Comment se passe l'inscription ?", a: "Cliquez sur 'Inscrire mon enfant' à côté de la période souhaitée. Nous vous recontactons sous 24h pour confirmer la place et procéder au paiement sécurisé." },
      { q: "Quel est le prix des stages ?", a: "449 CHF la semaine (4 demi-journées). Une réduction de 10% est appliquée pour le 2e enfant inscrit dans la même famille." },
      { q: "Que se passe-t-il en cas d'annulation ?", a: "Annulation gratuite jusqu'à 14 jours avant le début du stage. Au-delà, des frais peuvent s'appliquer (voir CGV). En cas d'imprévu majeur, nous trouvons toujours une solution." },
      { q: "Le stage donne-t-il lieu à un projet final ?", a: "Oui. Chaque stage se termine par un projet final que l'enfant peut présenter à sa famille et conserver. Un certificat de formation est également remis." },
    ],
  },
  EN: {
    pageTitle: 'Frequently asked questions',
    pageSubtitle: "Everything you need to know before enrolling your child. Can't find your answer? Write to us, we reply quickly.",
    searchPlaceholder: 'Search a question...',
    catGeneral: 'General', catPricing: 'Pricing & Subscriptions', catStages: 'Vacation camps',
    catGeneralDesc: 'About classes, equipment and how it works.',
    catPricingDesc: 'About our Solo and Duo plans and commitments.',
    catStagesDesc: 'About the camps during school holidays.',
    ctaTitle: "Can't find your answer?", ctaDesc: 'Our team usually replies in less than 24h.',
    ctaContact: 'Write to us', ctaWhatsapp: 'WhatsApp', noResults: 'No question matches your search.',
    navHome: 'Home', navProgramme: 'Programme', navTarifs: 'Pricing', navPremium: 'Premium', navStages: 'Camps', navFaq: 'FAQ', navBlog: 'Blog', navEnroll: 'Enroll my child',
    general: [
      { q: "What times are the lessons held?", a: "You choose: we're open from 9am to 7pm and agree together on a slot that works for you (after school, Wednesday, the weekend). The pace adapts to your child too, that's the whole point of a personalised course." },
      { q: "My child has no programming experience. Is that a problem?", a: "Not at all! Our classes are specially designed for complete beginners. We start with the basics and progress at a pace adapted to each child. No prerequisites required." },
      { q: "What equipment is needed?", a: "Your child needs a computer (PC, Mac or Chromebook) with a stable internet connection, headphones, and ideally a webcam. Everything works in the browser." },
      { q: "How do online sessions work?", a: "Sessions take place via video conference with a dedicated teacher. Your child sees the teacher's screen, asks questions live, and shares their own screen to receive personalized help. Sessions last 1h." },
      { q: "What's the minimum age?", a: "We welcome children from age 7. Content is adapted to each age group, the youngest start with Scratch, then progress to Python and beyond." },
      { q: "Who teaches the classes?", a: "Our classes are taught by teachers trained in our pedagogical method, designed by EPFL and ETHZ engineers. All our teachers share the same passion: making programming accessible with patience and care." },
      { q: "What if my child misses a session?", a: "Sessions can be rescheduled with 24h notice. We also provide a summary and exercises to catch up if needed." },
      { q: "Is there a certificate?", a: "Yes, each child receives a training certificate recognizing their skills and projects." },
      { q: "Can I attend sessions with my child?", a: "For younger children (7-9), we encourage a parent to be nearby for technical assistance. Older children usually follow independently." },
    ],
    pricing: [
      { q: "How do Solo and Duo plans work?", a: "The child can take the class Solo (individual) or in Duo with a sibling or friend. The best rates, namely 249 CHF/month Solo and 169 CHF/month per child in Duo, correspond to the 12-month commitment, which covers the core educational programming curriculum before specialization. The rate drops in Duo because the class is shared. For 3 or more children, contact us for a custom quote." },
      { q: "What's the difference between the 3, 6 and 12 month commitments?", a: "The longer the commitment, the lower the monthly rate (up to -17% over 12 months). The minimum commitment is 3 months (the length of a full module) so your child completes their learning journey. All commitments include the same content and the 1st-session guarantee." },
      { q: "What is the '1st session guarantee'?", a: "If you're not convinced after the first session, we fully refund you, no questions asked." },
      { q: "Can I switch commitment levels?", a: "You can switch to a longer commitment anytime (for example from 3 to 6 or 12 months) to benefit from a better rate. The opposite is not possible before the end of the subscribed period." },
      { q: "Which payment methods do you accept?", a: "Credit card (Visa, Mastercard, Apple Pay, Google Pay), bank transfer, and instalments. All payments are secured via Stripe." },
      { q: "Can I cancel my subscription?", a: "The subscription runs until the end of the chosen period (3, 6 or 12 months), then renews automatically and remains cancellable anytime after." },
      { q: "Are there hidden fees?", a: "No. The price is all-inclusive: classes, platform, certificate, resources. No registration fees, no surprises." },
    ],
    stages: [
      { q: "How long are camps?", a: "Camps last one week, with 4 half-days (morning OR afternoon, your choice). Each half-day is 3 hours." },
      { q: "Which themes are offered?", a: "Three themes available depending on periods: 'Build your first video game' (Scratch), Python Turtle (intro to code), and Pure Python (advanced)." },
      { q: "What's the minimum age?", a: "Camps are open from age 7. Groups are formed by close age ranges to ensure proper dynamics." },
      { q: "How does enrollment work?", a: "Click 'Enroll my child' next to your chosen period. We contact you within 24h to confirm the spot and process secure payment." },
      { q: "What's the price?", a: "CHF 449 per week (4 half-days). 10% discount for a 2nd child in the same family." },
      { q: "Cancellation policy?", a: "Free cancellation up to 14 days before the camp. Beyond that, fees may apply (see T&Cs). For major issues, we always find a solution." },
      { q: "Is there a final project?", a: "Yes. Each camp ends with a final project the child can present to their family and keep. A training certificate is also issued." },
    ],
  },
  DE: {
    pageTitle: 'Häufige Fragen',
    pageSubtitle: 'Alles, was Sie vor der Anmeldung wissen müssen. Finden Sie keine Antwort? Schreiben Sie uns, wir antworten schnell.',
    searchPlaceholder: 'Frage suchen...',
    catGeneral: 'Allgemein', catPricing: 'Preise & Abos', catStages: 'Ferien-Camps',
    catGeneralDesc: 'Über Kurse, Material und Ablauf.',
    catPricingDesc: 'Über Solo- und Duo-Formeln und Bindungen.',
    catStagesDesc: 'Über die Camps während der Schulferien.',
    ctaTitle: 'Keine Antwort gefunden?', ctaDesc: 'Unser Team antwortet meist in weniger als 24h.',
    ctaContact: 'Schreiben Sie uns', ctaWhatsapp: 'WhatsApp', noResults: 'Keine Frage entspricht Ihrer Suche.',
    navHome: 'Startseite', navProgramme: 'Programm', navTarifs: 'Preise', navPremium: 'Premium', navStages: 'Camps', navFaq: 'FAQ', navBlog: 'Blog', navEnroll: 'Kind anmelden',
    general: [
      { q: "Zu welchen Zeiten findet der Unterricht statt?", a: "Sie entscheiden: Wir sind von 9 bis 19 Uhr offen und legen gemeinsam einen passenden Termin fest (nach der Schule, mittwochs, am Wochenende). Auch das Tempo richtet sich nach Ihrem Kind, genau das macht personalisierten Unterricht aus." },
      { q: "Mein Kind hat keine Programmiererfahrung. Ist das ein Problem?", a: "Überhaupt nicht! Unsere Kurse sind speziell für absolute Anfänger konzipiert. Wir beginnen mit den Grundlagen und schreiten in kindgerechtem Tempo voran." },
      { q: "Welches Material wird benötigt?", a: "Ihr Kind braucht einen Computer (PC, Mac oder Chromebook) mit stabiler Internetverbindung, Kopfhörer und idealerweise eine Webcam. Alles funktioniert im Browser." },
      { q: "Wie laufen die Online-Sitzungen ab?", a: "Per Videokonferenz mit einer dedizierten Lehrperson. Ihr Kind sieht den Bildschirm, kann live Fragen stellen und seinen eigenen Bildschirm teilen. Sitzungen dauern 1h." },
      { q: "Ab welchem Alter?", a: "Wir nehmen Kinder ab 7 Jahren auf. Die Inhalte sind altersgerecht, die Jüngsten beginnen mit Scratch, dann Python und mehr." },
      { q: "Wer unterrichtet die Kurse?", a: "Unsere Kurse werden von Lehrkräften unterrichtet, die in unserer pädagogischen Methode geschult sind, entwickelt von EPFL- und ETHZ-Ingenieuren. Alle teilen dieselbe Leidenschaft: Programmierung mit Geduld und Sorgfalt zu vermitteln." },
      { q: "Was passiert, wenn mein Kind eine Sitzung verpasst?", a: "Sitzungen können mit 24h Vorankündigung umgeplant werden. Wir liefern auch Zusammenfassung und Übungen zum Aufholen." },
      { q: "Gibt es ein Zertifikat?", a: "Ja, jedes Kind erhält ein Ausbildungszertifikat." },
      { q: "Kann ich an Sitzungen teilnehmen?", a: "Für jüngere Kinder (7-9) empfehlen wir die Anwesenheit eines Elternteils für technische Hilfe. Ältere folgen meist autonom." },
    ],
    pricing: [
      { q: "Wie funktionieren Solo und Duo?", a: "Das Kind kann den Kurs solo oder im Duo mit einem Geschwister oder Freund besuchen. Die besten Tarife, nämlich 249 CHF/Monat Solo und 169 CHF/Monat pro Kind im Duo, entsprechen der 12-Monats-Bindung, die das grundlegende Programm der pädagogischen Programmierung vor der Spezialisierung abdeckt. Der Tarif sinkt im Duo, da der Kurs geteilt wird. Für 3 Kinder oder mehr kontaktieren Sie uns für ein individuelles Angebot." },
      { q: "Unterschied zwischen 3, 6 und 12 Monaten?", a: "Je länger die Bindung, desto niedriger der Monatspreis (bis zu -17% über 12 Monate). Die Mindestbindung beträgt 3 Monate (die Dauer eines vollständigen Moduls), damit Ihr Kind seinen Lernweg abschliesst. Alle Bindungen enthalten dieselben Inhalte und die 1.-Sitzung-Garantie." },
      { q: "Was ist die '1.-Sitzung-Garantie'?", a: "Wenn Sie nach der ersten Sitzung nicht überzeugt sind, erstatten wir den vollen Betrag, ohne Fragen." },
      { q: "Kann ich die Bindung ändern?", a: "Sie können jederzeit zu einer längeren Bindung wechseln (z. B. von 3 zu 6 oder 12 Monaten), um von einem besseren Tarif zu profitieren. Umgekehrt erst am Ende der gebuchten Periode." },
      { q: "Welche Zahlungsmethoden?", a: "Kreditkarte (Visa, Mastercard, Apple Pay, Google Pay), Banküberweisung, Ratenzahlung. Sicher über Stripe." },
      { q: "Kann ich kündigen?", a: "Das Abo läuft bis zum Ende der gewählten Periode (3, 6 oder 12 Monate), verlängert sich dann automatisch und bleibt danach jederzeit kündbar." },
      { q: "Versteckte Gebühren?", a: "Nein. Der Preis ist alles inklusive, keine Anmeldegebühren, keine Überraschungen." },
    ],
    stages: [
      { q: "Wie lange dauern Camps?", a: "Eine Woche mit 4 Halbtagen (Morgen ODER Nachmittag, Ihre Wahl). Jeder Halbtag dauert 3 Stunden." },
      { q: "Welche Themen?", a: "Drei Themen je nach Periode: 'Baue dein erstes Videospiel' (Scratch), Python Turtle (Einführung), und reines Python (Fortgeschrittene)." },
      { q: "Mindestalter?", a: "Camps ab 7 Jahren. Gruppen werden nach Alter zusammengestellt." },
      { q: "Wie funktioniert die Anmeldung?", a: "Klicken Sie auf 'Kind anmelden' bei der gewünschten Periode. Wir kontaktieren Sie innerhalb 24h zur Bestätigung und sicheren Zahlung." },
      { q: "Preis?", a: "449 CHF pro Woche (4 Halbtage). 10% Rabatt für ein 2. Kind aus der gleichen Familie." },
      { q: "Stornierung?", a: "Kostenlose Stornierung bis 14 Tage vor Camp. Danach können Gebühren anfallen (siehe AGB). Bei grossen Problemen finden wir immer eine Lösung." },
      { q: "Abschlussprojekt?", a: "Ja. Jedes Camp endet mit einem Abschlussprojekt, das das Kind präsentieren und behalten kann. Plus ein Ausbildungszertifikat." },
    ],
  },
};

export default function FAQ() {
  const [currentLang, setCurrentLang] = useState<Lang>(() => parseLocaleFromPath(window.location.pathname).locale);
  const navigate = useNavigate();
  const lp = (path: string) => localizedPath(path, currentLang);
  const [darkMode, setDarkMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>('general');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [search, setSearch] = useState('');
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

  // SEO
  useEffect(() => {
    const titles: Record<Lang, string> = {
      FR: 'FAQ, Smart Kids School | Réponses à vos questions',
      EN: 'FAQ, Smart Kids School | Answers to your questions',
      DE: 'FAQ, Smart Kids School | Antworten auf Ihre Fragen',
    };
    document.title = titles[currentLang];
    const setMeta = (name: string, content: string, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.content = content;
    };
    setMeta('description', currentLang === 'FR' ? 'Toutes les réponses sur les cours, tarifs et stages Smart Kids School.' : currentLang === 'EN' ? 'All answers about classes, pricing and camps at Smart Kids School.' : 'Alle Antworten zu Kursen, Preisen und Camps bei Smart Kids School.');
    setMeta('og:title', titles[currentLang], 'property');
    setMeta('og:url', `https://smartkids-school.ch${localizedPath('/faq', currentLang)}`, 'property');
    setHreflangTags('/faq', currentLang);
  }, [currentLang]);

  const t = T[currentLang];

  const categories: { key: Category; label: string; desc: string; icon: string; color: string; count: number }[] = [
    { key: 'general', label: t.catGeneral, desc: t.catGeneralDesc, icon: '🎓', color: 'from-[#232999] to-indigo-500', count: t.general.length },
    { key: 'pricing', label: t.catPricing, desc: t.catPricingDesc, icon: '💎', color: 'from-emerald-500 to-teal-500', count: t.pricing.length },
    { key: 'stages', label: t.catStages, desc: t.catStagesDesc, icon: '🌴', color: 'from-amber-500 to-orange-500', count: t.stages.length },
  ];

  const allFaqs: { cat: Category; items: FaqItem[] }[] = [
    { cat: 'general', items: t.general },
    { cat: 'pricing', items: t.pricing },
    { cat: 'stages', items: t.stages },
  ];

  // Filtrer selon recherche : si recherche active, on cherche dans toutes catégories
  const searchActive = search.trim().length > 1;
  const visibleFaqs: { cat: Category; items: FaqItem[] }[] = searchActive
    ? allFaqs.map(group => ({
        cat: group.cat,
        items: group.items.filter(f =>
          f.q.toLowerCase().includes(search.toLowerCase()) ||
          f.a.toLowerCase().includes(search.toLowerCase())
        )
      })).filter(g => g.items.length > 0)
    : allFaqs.filter(g => g.cat === activeCategory);

  const totalResults = visibleFaqs.reduce((sum, g) => sum + g.items.length, 0);

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
              <a href={lp('/faq')} className="text-sm font-semibold text-[#232999]">{t.navFaq}</a>
              <a href={lp('/blog')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.navBlog}</a>
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
                      <button key={lang} onClick={() => { setCurrentLang(lang); setShowLangDropdown(false); navigate(localizedPath('/faq', lang)); }} className={`w-full px-4 py-2.5 text-sm text-left transition-colors cursor-pointer ${currentLang === lang ? 'bg-[#232999] text-white font-semibold' : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-indigo-50'}`}>
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <a href={lp('/tarifs')} className="bg-[#232999] hover:bg-[#1a1f7a] text-white px-6 py-3 rounded-full text-sm font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 whitespace-nowrap">{t.navEnroll}</a>
            </div>
            <div className="md:hidden">
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
              <a href={lp('/faq')} className="block text-sm font-semibold py-2 text-[#232999]">{t.navFaq}</a>
              <a href={lp('/blog')} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.navBlog}</a>
              <div className="flex gap-2 py-2">
                {(['FR', 'EN', 'DE'] as Lang[]).map(lang => (
                  <button key={lang} onClick={() => { setCurrentLang(lang); navigate(localizedPath('/faq', lang)); }} className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${currentLang === lang ? 'bg-[#232999] text-white' : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{lang}</button>
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
          <span className={`px-4 py-2 rounded-full text-sm font-semibold inline-block ${darkMode ? 'bg-indigo-900/60 text-indigo-300' : 'bg-indigo-100 text-indigo-800'}`}>❓ FAQ</span>
          <h1 className={`text-4xl lg:text-5xl font-bold leading-tight mt-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.pageTitle}</h1>
          <p className={`text-lg mt-4 max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.pageSubtitle}</p>

          <div className="mt-8 max-w-xl mx-auto relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full pl-12 pr-4 py-3.5 rounded-full border-2 outline-none transition-all text-sm ${darkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-400' : 'bg-white border-gray-200 text-gray-900 focus:border-[#232999] focus:shadow-lg'}`}
            />
          </div>
        </div>
      </section>

      {/* ── Catégories tabs (cachées si recherche active) ── */}
      {!searchActive && (
        <section className={`py-12 px-4 ${darkMode ? 'bg-gray-950' : 'bg-white'}`}>
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-4">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => { setActiveCategory(cat.key); setOpenFaq(null); }}
                  className={`relative p-6 rounded-2xl border-2 text-left transition-all hover:shadow-lg cursor-pointer ${
                    activeCategory === cat.key
                      ? darkMode ? 'border-indigo-400 bg-gray-800' : 'border-[#232999] bg-indigo-50/50 shadow-md'
                      : darkMode ? 'border-gray-700 bg-gray-800/50 hover:border-gray-600' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${cat.color} rounded-xl flex items-center justify-center text-2xl mb-3`}>{cat.icon}</div>
                  <h3 className={`font-bold text-lg mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{cat.label}</h3>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{cat.desc}</p>
                  <span className={`absolute top-4 right-4 px-2 py-0.5 rounded-full text-xs font-bold ${activeCategory === cat.key ? 'bg-[#232999] text-white' : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{cat.count}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Liste des questions ── */}
      <section className={`py-12 px-4 ${darkMode ? 'bg-gray-950' : 'bg-gradient-to-br from-slate-50 to-white'}`}>
        <div className="max-w-3xl mx-auto">
          {searchActive && (
            <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {totalResults} {currentLang === 'FR' ? `résultat${totalResults > 1 ? 's' : ''}` : currentLang === 'EN' ? `result${totalResults > 1 ? 's' : ''}` : 'Ergebnisse'}
            </p>
          )}

          {totalResults === 0 ? (
            <div className={`text-center py-16 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <div className="text-5xl mb-4">🔍</div>
              <p>{t.noResults}</p>
            </div>
          ) : (
            visibleFaqs.map(group => (
              <div key={group.cat} className="mb-10">
                {searchActive && (
                  <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${darkMode ? 'text-indigo-400' : 'text-[#232999]'}`}>
                    {categories.find(c => c.key === group.cat)?.label}
                  </h2>
                )}
                <div className="space-y-3">
                  {group.items.map((f, i) => {
                    const id = `${group.cat}-${i}`;
                    const isOpen = openFaq === id;
                    return (
                      <div key={id} className={`rounded-2xl border overflow-hidden transition-all ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${isOpen ? 'shadow-md' : 'hover:shadow-sm'}`}>
                        <button onClick={() => setOpenFaq(isOpen ? null : id)} className={`w-full p-5 text-left flex items-center justify-between gap-4 transition-colors cursor-pointer ${isOpen ? darkMode ? 'bg-gray-700/50' : 'bg-indigo-50/50' : ''}`}>
                          <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{f.q}</span>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''} ${darkMode ? 'text-gray-400' : 'text-[#232999]'}`}><polyline points="6 9 12 15 18 9"/></svg>
                        </button>
                        {isOpen && (
                          <div className={`px-5 pb-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <p className="leading-relaxed">{f.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── CTA contact ── */}
      <section className="py-16 px-4 bg-gradient-to-br from-[#232999] via-[#1e2470] to-[#171b54] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{t.ctaTitle}</h2>
          <p className="text-lg text-white/90 mb-8">{t.ctaDesc}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:contact@smartkids-school.ch" className="bg-white text-[#232999] px-8 py-3 rounded-full font-bold hover:shadow-2xl transform hover:scale-105 transition-all">{t.ctaContact}</a>
            <a href="https://wa.me/41774768492" target="_blank" rel="noopener noreferrer" className="bg-[#25D366] hover:bg-[#1ebe5d] text-white px-8 py-3 rounded-full font-bold transition-all">{t.ctaWhatsapp}</a>
          </div>
        </div>
      </section>

      {/* ── WhatsApp Floating Button (niveau page, affiché une seule fois) ── */}
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

      {/* ── Footer ── */}
      <Footer currentLang={currentLang} darkMode={darkMode} />
      <CookieBanner currentLang={currentLang} darkMode={darkMode} />
    </div>
  );
}
