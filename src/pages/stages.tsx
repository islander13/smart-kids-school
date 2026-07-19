import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import CookieBanner from '../components/CookieBanner';
import { parseLocaleFromPath, localizedPath, setHreflangTags } from '../i18n/routing';

type Lang = 'FR' | 'EN' | 'DE';

const T = {
  FR: {
    nav: { home: 'Accueil', tarifs: 'Tarifs', premium: 'Premium', stages: 'Stages', programme: 'Programme', faq: 'FAQ', enroll: 'Inscrire mon enfant' },
    heroBadge: 'Stages Vacances · 100% en ligne',
    heroTitle1: 'Les vacances deviennent une',
    heroTitle2: 'aventure de code',
    heroDesc: "Une semaine intensive de programmation, robotique ou intelligence artificielle. 100% en ligne, où que vous soyez.",
    heroCta: 'Voir le calendrier',
    heroCta2: 'Choisir un thème',
    heroPill1: '4 jours d\'immersion',
    heroPill2: 'En ligne · Partout',
    heroPill3: 'Certificat de formation',

    // Why
    whyLabel: 'Pourquoi nos stages',
    whyTitle: 'Un format unique',
    whyDesc: "Entre le cours hebdomadaire qui avance lentement et l'écran isolé à la maison, nos stages créent un vrai moment d'immersion, avec d'autres enfants, encadré par un enseignant dédié.",
    why1T: 'Immersion totale',
    why1D: "Quatre demi-journées dans la semaine permettent à votre enfant d'entrer pour de bon dans la programmation. Un projet démarré en début de semaine devient un vrai jeu à la fin.",
    why2T: 'Bootcamp EPFL · ETHZ',
    why2D: "Un programme conçu par des ingénieurs diplômés des Écoles Polytechniques Fédérales. Pédagogie bienveillante, rigueur technique, et beaucoup de patience.",
    why3T: '100% en ligne',
    why3D: "Aucun déplacement. Votre enfant participe depuis chez vous, en visioconférence avec partage d'écran et assistance directe en temps réel.",
    why4T: 'Petits groupes',
    why4D: "5 enfants maximum par groupe. Chaque enfant reçoit une attention individuelle, chaque question trouve une vraie réponse.",
    why5T: 'Production concrète',
    why5D: "Le vendredi, chaque enfant repart avec un projet terminé, jeu, animation, robot virtuel ou modèle d'IA, partageable avec la famille.",
    why6T: 'Pas que du code',
    why6D: "Nous alternons code, défis logiques, pauses créatives et activités déconnectées. Les yeux de votre enfant ne resteront pas vissés à l'écran.",

    // Formats
    formatsLabel: 'Deux formats au choix',
    formatsTitle: 'Demi-journée matin ou après-midi',
    formatsDesc: "Selon l'âge de votre enfant, son endurance et vos disponibilités.",
    format1T: 'Demi-journée',
    format1Sub: '3h / jour',
    format1Price: '449 CHF',
    format1PriceSub: 'la semaine (4 demi-journées)',
    format1I1: 'Matin 09h00 – 12h00 ou après-midi 14h00 – 17h00',
    format1I2: 'Pauses énergisantes intégrées',
    format1I3: 'Adapté aux 6-9 ans',
    format1I4: "Projet final remis à l'enfant",
    // Themes
    themesLabel: 'Choisissez votre aventure',
    themesTitle: 'Trois thèmes, trois aventures',
    themesDesc: "Trois aventures pédagogiques au choix selon l'âge et le niveau de votre enfant. Disponibles à chaque période de vacances scolaires.",
    theme1T: 'Crée ton premier jeu vidéo',
    theme1A: '6-10 ans',
    theme1D: "Découverte de Scratch et création d'un jeu d'arcade de A à Z : personnage, ennemis, scores, sons, écran de victoire.",
    theme1Tag: 'Scratch · Débutant',
    theme2T: 'Python avec Turtle : code et dessine',
    theme2A: '8-12 ans',
    theme2D: "Premier vrai langage de code, mais avec des dessins ! Turtle graphics permet de programmer des spirales, fractales et animations géométriques.",
    theme2Tag: 'Python Turtle · Pont entre Scratch et Python',
    theme3T: 'Python : apprenti développeur',
    theme3A: '10-14 ans',
    theme3D: "Mini-jeux en ligne de commande, calculs automatisés, premier vrai projet. La porte d'entrée du développement professionnel.",
    theme3Tag: 'Python · Intermédiaire',

    // Day type
    dayLabel: 'Une journée type',
    dayTitle: "Heure par heure, ce que vivra votre enfant",
    dayDesc: "Exemple d'un stage 'Crée ton jeu vidéo' en journée complète.",
    day1T: '08h45 – 09h00', day1D: "Connexion, vérification du matériel, café virtuel pour les parents",
    day2T: '09h00 – 10h30', day2D: "Atelier code : nouvelle notion expliquée puis appliquée immédiatement",
    day3T: '10h30 – 10h50', day3D: "Pause active, défi logique non-numérique partagé en groupe",
    day4T: '10h50 – 12h00', day4D: "Code libre encadré : chaque enfant avance son propre projet",
    day5T: '12h00 – 13h30', day5D: "Pause déjeuner, l'enfant déjeune chez vous, en famille",
    day6T: '13h30 – 14h30', day6D: "Activité déconnectée : dessin, débat, défi papier-crayon",
    day7T: '14h30 – 16h30', day7D: "Atelier d'après-midi : ajout d'une nouvelle fonctionnalité au projet",
    day8T: '16h30 – 17h00', day8D: "Partage d'écran : chaque enfant montre ses avancées du jour",

    // Calendar
    calendarLabel: 'Calendrier scolaire suisse',
    calendarTitle: 'Toutes les périodes de vacances',
    calendarDesc: 'Nous proposons des stages à chaque période de vacances scolaires. Réservez tôt, les places sont limitées à 5 enfants par groupe.',
    calendarNote: "Places limitées à 5 enfants par groupe.",

    period1Title: 'Vacances d\'automne',
    period1Dates: 'Octobre',
    period1Sub: '1 semaine',
    period1Themes: 'Scratch jeu vidéo · Python Turtle',

    period2Title: 'Vacances de Noël',
    period2Dates: 'Fin décembre – début janvier',
    period2Sub: '2 semaines',
    period2Themes: 'Scratch jeu vidéo · Python Turtle',

    period3Title: 'Relâches de février',
    period3Dates: 'Mi-février',
    period3Sub: '1 semaine',
    period3Themes: 'Python Turtle · Python développeur',

    period4Title: 'Vacances de Pâques',
    period4Dates: 'Avril',
    period4Sub: '2 semaines',
    period4Themes: 'Tous les thèmes au choix',

    period5Title: 'Pont de l\'Ascension',
    period5Dates: 'Mai',
    period5Sub: '4 jours',
    period5Themes: 'Format intensif · Python Turtle',

    period6Title: 'Vacances d\'été',
    period6Dates: 'Juillet – Août',
    period6Sub: '6 semaines',
    period6Themes: 'Tous les thèmes · Le rendez-vous incontournable',

    register: 'Inscrire mon enfant',

    // Pricing extras
    pricingReduc: '99 CHF de réduction pour le 2e enfant de la même famille',
    pricingEarly: 'Réservation anticipée (30 jours avant) : −50 CHF',
    pricingPayment: 'Paiement en 2 fois possible sans frais',

    // CTA
    ctaTitle: 'Prêt à offrir une semaine mémorable à votre enfant ?',
    ctaDesc: "Réservez la place de votre enfant pour la prochaine session, confirmation et paiement sous 24h.",
    ctaBtn: 'Inscrire mon enfant',
    ctaWhatsapp: 'WhatsApp',

    // Partnership
    partnerTitle: 'Une école reconnue à nos côtés',
    partnerDesc: "En collaboration avec l'École du Valentin (Lausanne), institution lausannoise de référence depuis des décennies, partageant nos valeurs d'éducation sur mesure et d'excellence pédagogique.",
    partnerLink: "Découvrir l'École du Valentin →",
    faqLabel: 'Questions fréquentes',
    faqTitle: 'Vos questions sur les stages',
    faqDesc: 'Tout ce que vous devez savoir avant de réserver.',
    faqs: [
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
    nav: { home: 'Home', tarifs: 'Pricing', premium: 'Premium', stages: 'Camps', programme: 'Program', faq: 'FAQ', enroll: 'Enroll my child' },
    heroBadge: 'Vacation Camps · 100% online',
    heroTitle1: 'Vacation becomes a',
    heroTitle2: 'coding adventure',
    heroDesc: "An intensive week of coding, robotics or AI. 100% online, wherever you are.",
    heroCta: 'See calendar', heroCta2: 'Choose a theme',
    heroPill1: '4 days of immersion', heroPill2: 'Online · Anywhere', heroPill3: 'Training certificate',

    whyLabel: 'Why our camps', whyTitle: 'A unique format',
    whyDesc: "Between the slow weekly class and the isolated screen at home, our camps create real immersion, with other kids and a dedicated teacher.",
    why1T: 'Full immersion',
    why1D: "Four half-days through the week let your child truly dive in. A project started early becomes a real game by the end of the week.",
    why2T: 'EPFL · ETHZ bootcamp',
    why2D: "A curriculum designed by graduates from Switzerland's Federal Institutes of Technology. Caring pedagogy, technical rigour, lots of patience.",
    why3T: '100% online',
    why3D: "No travel. Your child joins from home, with video, screen sharing and real-time assistance.",
    why4T: 'Small groups',
    why4D: "5 children max per group. Each gets individual attention, each question gets a real answer.",
    why5T: 'Real deliverables',
    why5D: "On Friday, each child takes home a finished project, game, animation, virtual robot or AI model, to share.",
    why6T: 'Not just code',
    why6D: "We alternate coding, logic challenges, creative breaks and offline activities. Your child won't be glued to a screen.",

    formatsLabel: 'Two formats', formatsTitle: 'Half-day morning or afternoon',
    formatsDesc: "Depending on age, energy and your schedule.",
    format1T: 'Half-day', format1Sub: '3h / day', format1Price: 'CHF 449', format1PriceSub: 'per week (4 half-days)',
    format1I1: 'Morning 9 AM – 12 PM or afternoon 2 PM – 5 PM', format1I2: 'Energising breaks built in',
    format1I3: 'For ages 6-9', format1I4: 'Final project taken home',
    themesLabel: 'Choose your adventure', themesTitle: 'Three themes, three adventures',
    themesDesc: 'A different theme each holiday. Stack several through the year for a complete path.',
    theme1T: 'Build your first video game', theme1A: 'Ages 6-10',
    theme1D: 'Discover Scratch and build an arcade game from scratch: character, enemies, scores, sounds, win screen.',
    theme1Tag: 'Scratch · Beginner',
    theme2T: 'Python with Turtle: code and draw', theme2A: 'Ages 8-12',
    theme2D: 'First real programming language, with drawings! Turtle graphics for spirals, fractals and geometric animations.',
    theme2Tag: 'Python Turtle · Bridge from Scratch to Python',
    theme3T: "Python: developer's apprentice", theme3A: 'Ages 10-14',
    theme3D: 'Command-line mini-games, automated calculations, first real project. The gateway to professional development.',
    theme3Tag: 'Python · Intermediate',

    dayLabel: 'A typical day', dayTitle: 'Hour by hour, what your child experiences',
    dayDesc: 'Example of a "Build your video game" full-day camp.',
    day1T: '8:45 – 9 AM', day1D: 'Connection, equipment check, virtual coffee for parents',
    day2T: '9 – 10:30 AM', day2D: 'Code workshop: new concept explained then immediately applied',
    day3T: '10:30 – 10:50', day3D: 'Active break, group offline logic challenge',
    day4T: '10:50 – 12 PM', day4D: 'Guided free coding: each child advances their own project',
    day5T: '12 – 1:30 PM', day5D: 'Lunch break, at home with family',
    day6T: '1:30 – 2:30 PM', day6D: 'Offline activity: drawing, debate, paper puzzle',
    day7T: '2:30 – 4:30 PM', day7D: 'Afternoon workshop: new feature added to the project',
    day8T: '4:30 – 5 PM', day8D: 'Screen sharing: each child shows the day\'s progress',

    calendarLabel: 'Swiss school calendar', calendarTitle: 'All vacation periods',
    calendarDesc: 'We run camps every Swiss school holiday. Book early, only 5 spots per group.',
    calendarNote: 'Limited to 5 children per group.',

    period1Title: 'Autumn break', period1Dates: 'October', period1Sub: '1 week', period1Themes: 'Scratch video game · Python Turtle',
    period2Title: 'Christmas holidays', period2Dates: 'Late Dec – early Jan', period2Sub: '2 weeks', period2Themes: 'Scratch video game · Python Turtle',
    period3Title: 'February break', period3Dates: 'Mid-February', period3Sub: '1 week', period3Themes: 'Python Turtle · Python developer',
    period4Title: 'Easter holidays', period4Dates: 'April', period4Sub: '2 weeks', period4Themes: 'All themes available',
    period5Title: 'Ascension long weekend', period5Dates: 'May', period5Sub: '4 days', period5Themes: 'Short intensive · Python Turtle',
    period6Title: 'Summer holidays', period6Dates: 'July – August', period6Sub: '6 weeks', period6Themes: 'All themes · The big one',
    register: 'Enroll my child',

    pricingReduc: '99 CHF off for a 2nd child of the same family',
    pricingEarly: 'Early booking (30 days ahead): CHF 50 off',
    pricingPayment: '2 instalments available, no fees',

    ctaTitle: 'Ready to give your child an unforgettable week?',
    ctaDesc: 'Join our waiting list to be notified first when registration opens.',
    ctaBtn: 'Enroll my child', ctaWhatsapp: 'WhatsApp',

    partnerTitle: 'A respected school by our side',
    partnerDesc: "In collaboration with École du Valentin (Lausanne), a leading Lausanne institution for decades, sharing our values of tailored education and pedagogical excellence.",
    partnerLink: 'Discover École du Valentin →',
    faqLabel: 'Frequently asked questions',
    faqTitle: 'Your questions about camps',
    faqDesc: 'Everything you need to know before booking.',
    faqs: [
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
    nav: { home: 'Startseite', tarifs: 'Preise', premium: 'Premium', stages: 'Camps', programme: 'Programm', faq: 'FAQ', enroll: 'Kind anmelden' },
    heroBadge: 'Ferien-Camps · 100% online',
    heroTitle1: 'Ferien werden zum',
    heroTitle2: 'Code-Abenteuer',
    heroDesc: 'Eine intensive Woche Programmieren, Robotik oder KI. 100% online, wo immer Sie sind.',
    heroCta: 'Kalender ansehen', heroCta2: 'Thema wählen',
    heroPill1: '4 Tage Immersion', heroPill2: 'Online · Überall', heroPill3: 'Ausbildungszertifikat',

    whyLabel: 'Warum unsere Camps', whyTitle: 'Ein einzigartiges Format',
    whyDesc: 'Zwischen dem langsamen Wochenkurs und dem isolierten Bildschirm zu Hause schaffen unsere Camps echte Immersion.',
    why1T: 'Volle Immersion', why1D: 'Vier Halbtage in der Woche erlauben Ihrem Kind, wirklich einzutauchen.',
    why2T: 'EPFL · ETHZ Bootcamp', why2D: 'Ein Lehrplan, entwickelt von Absolventen der Eidg. Technischen Hochschulen.',
    why3T: '100% online', why3D: 'Keine Fahrt. Ihr Kind nimmt von zu Hause teil, mit Video und Bildschirmfreigabe.',
    why4T: 'Kleine Gruppen', why4D: 'Maximal 5 Kinder pro Gruppe. Jedes erhält individuelle Aufmerksamkeit.',
    why5T: 'Konkrete Ergebnisse', why5D: 'Am Freitag nimmt jedes Kind ein fertiges Projekt mit nach Hause.',
    why6T: 'Nicht nur Code', why6D: 'Wir wechseln Code, Logikrätsel, Kreativpausen und Offline-Aktivitäten.',

    formatsLabel: 'Zwei Formate', formatsTitle: 'Halbtag morgens oder nachmittags',
    formatsDesc: 'Je nach Alter, Energie und Verfügbarkeit.',
    format1T: 'Halbtag', format1Sub: '3h / Tag', format1Price: 'CHF 449', format1PriceSub: 'pro Woche (4 Halbtage)',
    format1I1: 'Morgens 9-12 Uhr oder nachmittags 14-17 Uhr', format1I2: 'Aktive Pausen integriert',
    format1I3: 'Für 6-9 Jahre', format1I4: 'Abschlussprojekt zum Mitnehmen',
    themesLabel: 'Wähle dein Abenteuer', themesTitle: 'Drei Themen, drei Abenteuer',
    themesDesc: 'Ein anderes Thema pro Ferienperiode.',
    theme1T: 'Baue dein erstes Videospiel', theme1A: '6-10 Jahre',
    theme1D: 'Scratch entdecken und ein Arcade-Spiel von Grund auf bauen.',
    theme1Tag: 'Scratch · Anfänger',
    theme2T: 'Python mit Turtle: codieren und zeichnen', theme2A: '8-12 Jahre',
    theme2D: 'Erste echte Programmiersprache, mit Zeichnungen! Turtle für Spiralen, Fraktale und geometrische Animationen.',
    theme2Tag: 'Python Turtle · Brücke von Scratch zu Python',
    theme3T: 'Python: Entwickler-Lehrling', theme3A: '10-14 Jahre',
    theme3D: 'Mini-Spiele in der Kommandozeile, automatisierte Berechnungen, erstes echtes Projekt. Die Tür zur professionellen Entwicklung.',
    theme3Tag: 'Python · Mittelstufe',

    dayLabel: 'Ein typischer Tag', dayTitle: 'Stunde für Stunde',
    dayDesc: 'Beispiel eines Ganztags-Camps.',
    day1T: '8:45 – 9:00', day1D: 'Verbindung, Material-Check, virtueller Kaffee',
    day2T: '9:00 – 10:30', day2D: 'Code-Workshop: neues Konzept + Anwendung',
    day3T: '10:30 – 10:50', day3D: 'Aktive Pause, Offline-Logikrätsel',
    day4T: '10:50 – 12:00', day4D: 'Freies Programmieren: eigenes Projekt',
    day5T: '12:00 – 13:30', day5D: 'Mittagspause, zu Hause mit Familie',
    day6T: '13:30 – 14:30', day6D: 'Offline: Zeichnen, Debatte, Papierrätsel',
    day7T: '14:30 – 16:30', day7D: 'Nachmittag: neue Funktion im Projekt',
    day8T: '16:30 – 17:00', day8D: 'Bildschirmfreigabe: Tagesfortschritt',

    calendarLabel: 'Schulkalender Schweiz', calendarTitle: 'Alle Ferienperioden',
    calendarDesc: 'Wir bieten Camps in allen Schulferien. Früh buchen, nur 5 Plätze pro Gruppe.',
    calendarNote: 'Begrenzt auf 5 Kinder pro Gruppe.',

    period1Title: 'Herbstferien', period1Dates: 'Oktober', period1Sub: '1 Woche', period1Themes: 'Baue dein erstes Videospiel · Python Turtle',
    period2Title: 'Weihnachtsferien', period2Dates: 'Ende Dez – Anfang Jan', period2Sub: '2 Wochen', period2Themes: 'Baue dein erstes Videospiel',
    period3Title: 'Sportferien', period3Dates: 'Mitte Februar', period3Sub: '1 Woche', period3Themes: 'Python Turtle · Reines Python',
    period4Title: 'Osterferien', period4Dates: 'April', period4Sub: '2 Wochen', period4Themes: 'Alle Themen verfügbar',
    period5Title: 'Auffahrt', period5Dates: 'Mai', period5Sub: '4 Tage', period5Themes: 'Kurz-Intensiv · Python Turtle',
    period6Title: 'Sommerferien', period6Dates: 'Juli – August', period6Sub: '6 Wochen', period6Themes: 'Alle Themen · Das grosse Highlight',
    register: 'Kind anmelden',

    pricingReduc: '99 CHF Rabatt für ein 2. Kind derselben Familie',
    pricingEarly: 'Frühbuchung (30 Tage vorher): 50 CHF Rabatt',
    pricingPayment: 'Ratenzahlung in 2 Raten kostenlos',

    ctaTitle: 'Bereit, Ihrem Kind eine unvergessliche Woche zu schenken?',
    ctaDesc: 'Tragen Sie sich in die Warteliste ein, um bei Anmeldungsöffnung benachrichtigt zu werden.',
    ctaBtn: 'Kind anmelden', ctaWhatsapp: 'WhatsApp',

    partnerTitle: 'Eine renommierte Schule an unserer Seite',
    partnerDesc: 'In Zusammenarbeit mit der École du Valentin (Lausanne), einer renommierten Lausanner Institution.',
    partnerLink: 'École du Valentin entdecken →',
    faqLabel: 'Häufige Fragen',
    faqTitle: 'Ihre Fragen zu den Camps',
    faqDesc: 'Alles, was Sie vor der Buchung wissen müssen.',
    faqs: [
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

export default function Stages() {
  const [currentLang, setCurrentLang] = useState<Lang>(() => parseLocaleFromPath(window.location.pathname).locale);
  const navigate = useNavigate();
  const lp = (path: string) => localizedPath(path, currentLang);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try { return localStorage.getItem('sks_theme') === 'dark'; } catch { return false; }
  });
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);
  // ── Modal d'inscription stage ──
  const [showStageModal, setShowStageModal] = useState(false);
  const [selectedStagePeriod, setSelectedStagePeriod] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [stageFormData, setStageFormData] = useState({
    parentName: '',
    email: '',
    phone: '',
    preferredSession: '',
    message: '',
    numChildren: 1,
    children: [{ name: '', age: '' }, { name: '', age: '' }],
  });
  const [stageSubmitMessage, setStageSubmitMessage] = useState('');
  const [stageSubmitting, setStageSubmitting] = useState(false);

  const openStageModal = (period: string) => {
    setSelectedStagePeriod(period);
    setSelectedWeek('');
    setStageSubmitMessage('');
    setShowStageModal(true);
    // Nettoie l'URL (efface tout #ancre résiduel) et pointe vers le lien
    // partageable du formulaire, pour que copier la barre d'adresse à ce
    // moment-là redonne toujours un lien direct et propre.
    navigate(localizedPath('/stages/inscription', currentLang), { replace: true });
    try { (window as any).gtag?.('event', 'stage_modal_open', { period }); } catch {}
    try { (window as any).fbq?.('track', 'InitiateCheckout', { content_name: 'Stage été', content_category: period, currency: 'CHF' }); } catch {}
  };

  const closeStageModal = () => {
    setShowStageModal(false);
    setStageSubmitMessage('');
    const { basePath } = parseLocaleFromPath(window.location.pathname);
    if (basePath === '/stages/inscription') {
      navigate(localizedPath('/stages', currentLang), { replace: true });
    }
  };

  const handleStageSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStageSubmitting(true);
    setStageSubmitMessage('');

    // Validation : tous les enfants doivent avoir nom + âge
    const validChildren = stageFormData.children.slice(0, stageFormData.numChildren);
    for (let i = 0; i < stageFormData.numChildren; i++) {
      if (!validChildren[i].name.trim() || !validChildren[i].age.trim()) {
        setStageSubmitMessage('error_missing_child');
        setStageSubmitting(false);
        return;
      }
    }

    try {
      // ─── 1. Soumettre à Netlify (notification + suivi) ───
      const formData = new FormData();
      formData.append('form-name', 'stage-enrollment');
      formData.append('period', selectedStagePeriod);
      formData.append('selectedWeek', selectedWeek);
      formData.append('parentName', stageFormData.parentName);
      formData.append('email', stageFormData.email);
      formData.append('phone', stageFormData.phone);
      formData.append('preferredSession', stageFormData.preferredSession);
      formData.append('message', stageFormData.message);
      formData.append('numChildren', String(stageFormData.numChildren));
      validChildren.forEach((child, i) => {
        formData.append(`child${i + 1}Name`, child.name);
        formData.append(`child${i + 1}Age`, child.age);
      });
      formData.append('priceTotal', stageFormData.numChildren === 1 ? '449 CHF' : '799 CHF');

      const netlifyRes = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as any).toString(),
      });

      if (!netlifyRes.ok) {
        setStageSubmitMessage('error');
        return;
      }

      try { (window as any).gtag?.('event', 'stage_enrollment_submit', { children: stageFormData.numChildren }); } catch {}

      // ─── 2. Créer la session Stripe Checkout via Netlify Function (CHF strict) ───
      setStageSubmitMessage('redirecting');

      const productKey = stageFormData.numChildren === 1 ? 'stage-1child' : 'stage-2children';

      const checkoutRes = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productKey: productKey,
          customerEmail: stageFormData.email,
          metadata: {
            parentName: stageFormData.parentName,
            phone: stageFormData.phone,
            period: selectedStagePeriod,
            preferredSession: stageFormData.preferredSession,
            numChildren: String(stageFormData.numChildren),
            child1Name: validChildren[0]?.name || '',
            child1Age: validChildren[0]?.age || '',
            child2Name: validChildren[1]?.name || '',
            child2Age: validChildren[1]?.age || '',
          },
        }),
      });

      if (!checkoutRes.ok) {
        const error = await checkoutRes.json();
        console.error('Checkout error:', error);
        setStageSubmitMessage('error');
        return;
      }

      const { url } = await checkoutRes.json();
      if (!url) {
        setStageSubmitMessage('error');
        return;
      }

      window.location.href = url;
    } catch (err) {
      console.error('Submit error:', err);
      setStageSubmitMessage('error');
    } finally {
      setStageSubmitting(false);
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showStageModal) closeStageModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showStageModal]);

  // Re-sync depuis localStorage quand l'onglet redevient visible
  // (fix : sur mobile iOS/Android, le retour depuis une autre app peut réinitialiser l'état React)
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

  useEffect(() => {
    try {
      localStorage.setItem('sks_theme', darkMode ? 'dark' : 'light');
      localStorage.setItem('sks_lang', currentLang);
    } catch {}
  }, [darkMode, currentLang]);

  useEffect(() => {
    const titles: Record<Lang, string> = {
      FR: 'Stages programmation enfants en ligne, Vacances scolaires Suisse | Smart Kids School',
      EN: 'Online kids coding camps, School holidays Switzerland | Smart Kids School',
      DE: 'Online Programmier-Camps für Kinder, Schweizer Schulferien | Smart Kids School',
    };
    const descs: Record<Lang, string> = {
      FR: 'Stages de programmation, robotique et IA en ligne pour enfants de 7 à 15 ans pendant les vacances scolaires. École suisse, ingénieurs EPFL & ETHZ. 100% en ligne, dès 449 CHF la semaine.',
      EN: 'Online programming, robotics and AI camps for children 7-15 during Swiss school holidays. Led by EPFL & ETHZ engineers. From CHF 449/week.',
      DE: 'Online Programmier-, Robotik- und KI-Camps für Kinder 7-15 während der Schweizer Schulferien. Von EPFL & ETHZ Ingenieuren. Ab 449 CHF/Woche.',
    };
    document.title = titles[currentLang];
    const setMeta = (name: string, content: string, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.content = content;
    };
    setMeta('description', descs[currentLang]);
    setMeta('og:title', titles[currentLang], 'property');
    setMeta('og:description', descs[currentLang], 'property');
    const { basePath } = parseLocaleFromPath(window.location.pathname);
    const isFormDeeplink = basePath.endsWith('/inscription');
    setMeta('og:url', `https://smartkids-school.ch${localizedPath(basePath, currentLang)}`, 'property');
    if (isFormDeeplink) {
      setMeta('robots', 'noindex, follow');
    } else {
      setHreflangTags('/stages', currentLang);
    }
  }, [currentLang]);

  const t = T[currentLang];

  const themes = [
    { icon: 'ri-gamepad-line', color: 'from-rose-500 to-pink-500', title: t.theme1T, desc: t.theme1D, tag: t.theme1Tag },
    { icon: 'ri-pencil-ruler-2-line', color: 'from-sky-500 to-blue-500', title: t.theme2T, desc: t.theme2D, tag: t.theme2Tag },
    { icon: 'ri-code-s-slash-line', color: 'from-emerald-500 to-teal-500', title: t.theme3T, desc: t.theme3D, tag: t.theme3Tag },
  ];

  const daySchedule = [
    { time: t.day1T, desc: t.day1D }, { time: t.day2T, desc: t.day2D },
    { time: t.day3T, desc: t.day3D }, { time: t.day4T, desc: t.day4D },
    { time: t.day5T, desc: t.day5D }, { time: t.day6T, desc: t.day6D },
    { time: t.day7T, desc: t.day7D }, { time: t.day8T, desc: t.day8D },
  ];

  // L'été a son grand bandeau en vedette au-dessus. On le rappelle aussi
  // en tête de cette grille (avec un léger accent), suivi des autres périodes.
  const calendar = [
    { period: t.period6Title, dates: t.period6Dates, sub: t.period6Sub, themes: t.period6Themes, emoji: '☀️', highlight: true },
    { period: t.period1Title, dates: t.period1Dates, sub: t.period1Sub, themes: t.period1Themes, emoji: '🍂' },
    { period: t.period2Title, dates: t.period2Dates, sub: t.period2Sub, themes: t.period2Themes, emoji: '🎄' },
    { period: t.period3Title, dates: t.period3Dates, sub: t.period3Sub, themes: t.period3Themes, emoji: '⛷️' },
    { period: t.period4Title, dates: t.period4Dates, sub: t.period4Sub, themes: t.period4Themes, emoji: '🌷' },
    { period: t.period5Title, dates: t.period5Dates, sub: t.period5Sub, themes: t.period5Themes, emoji: '🌿' },
  ];

  // ── Semaines de stage d'été (AJUSTER LES DATES ICI si besoin) ──
  // Pour une autre saison : remplacer cette liste par les semaines de la période concernée.
  // `end` = dernier jour du stage. Une fois cette date passée, le créneau s'affiche
  // automatiquement comme "Terminé" (grisé, non sélectionnable). Rien à faire manuellement.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // AJUSTER LES DATES ICI. `start` = 1er jour, `end` = dernier jour.
  // Une semaine se ferme automatiquement dès qu'elle COMMENCE (on ne rejoint
  // pas un stage déjà lancé) : 'ongoing' pendant, 'past' une fois terminée.
  const summerWeeks = [
    { id: 'sem1', start: '2026-07-06', end: '2026-07-10', label: currentLang === 'FR' ? 'Semaine 1 · 6-10 juillet' : currentLang === 'EN' ? 'Week 1 · July 6-10' : 'Woche 1 · 6.-10. Juli' },
    { id: 'sem2', start: '2026-07-13', end: '2026-07-17', label: currentLang === 'FR' ? 'Semaine 2 · 13-17 juillet' : currentLang === 'EN' ? 'Week 2 · July 13-17' : 'Woche 2 · 13.-17. Juli' },
    { id: 'sem3', start: '2026-07-20', end: '2026-07-24', label: currentLang === 'FR' ? 'Semaine 3 · 20-24 juillet' : currentLang === 'EN' ? 'Week 3 · July 20-24' : 'Woche 3 · 20.-24. Juli' },
    { id: 'sem4', start: '2026-08-10', end: '2026-08-14', label: currentLang === 'FR' ? 'Semaine 4 · 10-14 août' : currentLang === 'EN' ? 'Week 4 · Aug 10-14' : 'Woche 4 · 10.-14. August' },
    { id: 'sem5', start: '2026-08-17', end: '2026-08-21', label: currentLang === 'FR' ? 'Semaine 5 · 17-21 août' : currentLang === 'EN' ? 'Week 5 · Aug 17-21' : 'Woche 5 · 17.-21. August' },
    { id: 'flex', start: null, end: null, label: currentLang === 'FR' ? 'Flexible / à définir ensemble' : currentLang === 'EN' ? 'Flexible / to be defined' : 'Flexibel / noch offen' },
  ].map(w => {
    if (!w.start || !w.end) return { ...w, status: 'open' };
    const started = new Date(w.start + 'T00:00:00') <= today;
    const finished = new Date(w.end + 'T00:00:00') < today;
    return { ...w, status: finished ? 'past' : started ? 'ongoing' : 'open' };
  });

  // Semaines encore réservables → urgence honnête, calculée toute seule
  const openWeeksCount = summerWeeks.filter(w => w.start && w.status === 'open').length;

  const statusLabel = (st: string) =>
    st === 'past'
      ? (currentLang === 'FR' ? 'Terminé' : currentLang === 'EN' ? 'Finished' : 'Beendet')
      : (currentLang === 'FR' ? 'En cours' : currentLang === 'EN' ? 'Ongoing' : 'Läuft');

  // Lien direct vers le formulaire (ex: /stages/inscription) : ouvre la modal
  // automatiquement sur les stages d'été (période phare du moment).
  useEffect(() => {
    const { basePath } = parseLocaleFromPath(window.location.pathname);
    if (basePath === '/stages/inscription') {
      openStageModal(`${t.period6Title} (${t.period6Dates})`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`min-h-screen font-['Inter',sans-serif] transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>

      {/* ── Navigation ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm shadow-sm transition-colors duration-300 ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center gap-3">
              <a href={lp('/')}><img src="Logo_official_dark.png" alt="Smart Kids School" width="192" height="64" className="h-16 w-auto" /></a>
              <img src="flag-ch.png" alt="Drapeau de la Suisse" width="24" height="24" className="h-6 w-auto rounded-sm shadow-sm" />
            </div>
            <div className="hidden md:flex items-center gap-8 ml-8">
              <a href={lp('/')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.nav.home}</a>
              <a href={lp('/#parcours')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.nav.programme}</a>
              <a href={lp('/tarifs')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.nav.tarifs}</a>
              <a href={lp('/stages')} className="text-sm font-semibold text-[#232999]">{t.nav.stages}</a>
              <a href={lp('/faq')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.nav.faq}</a>
            </div>
            <div className="hidden md:flex items-center gap-3 ml-6">
              <button onClick={() => setDarkMode(!darkMode)} className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-300 cursor-pointer ${darkMode ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-100 border-gray-200 text-gray-700 hover:border-indigo-400'}`}>
                {darkMode
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
              </button>
              <div className="relative">
                <button onClick={() => setShowLangDropdown(!showLangDropdown)} className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors cursor-pointer ${darkMode ? 'border-gray-600 hover:border-indigo-400 text-gray-300' : 'border-gray-200 hover:border-indigo-400 text-gray-700'}`}>
                  <span className="text-sm font-medium">{currentLang}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={showLangDropdown ? 'rotate-180' : ''}><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {showLangDropdown && (
                  <div className={`absolute top-full right-0 mt-2 rounded-lg shadow-lg border overflow-hidden z-50 min-w-[80px] ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    {(['FR','EN','DE'] as Lang[]).map(lang => (
                      <button key={lang} onClick={() => { setCurrentLang(lang); setShowLangDropdown(false); navigate(localizedPath('/stages', lang)); }}
                        className={`w-full px-4 py-2.5 text-sm text-left transition-colors cursor-pointer ${currentLang === lang ? 'bg-[#232999] text-white font-semibold' : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-indigo-50'}`}>
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => openStageModal(`${t.period6Title} (${t.period6Dates})`)} className="bg-[#232999] hover:bg-[#1a1f7a] text-white px-6 py-3 rounded-full text-sm font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer">{t.nav.enroll}</button>
            </div>

            {/* Mobile burger + dark toggle */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={() => setDarkMode(!darkMode)} aria-label="Toggle theme" className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 cursor-pointer ${darkMode ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-100 border-gray-200 text-gray-700'}`}>
                {darkMode
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
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
              <a href={lp('/')} onClick={() => setMobileMenuOpen(false)} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.nav.home}</a>
              <a href={lp('/tarifs')} onClick={() => setMobileMenuOpen(false)} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.nav.tarifs}</a>
              <a href={lp('/stages')} onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold py-2 text-[#232999]">{t.nav.stages}</a>
              <a href={lp('/faq')} onClick={() => setMobileMenuOpen(false)} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.nav.faq}</a>
              <div className="flex gap-2 py-2">
                {(['FR', 'EN', 'DE'] as Lang[]).map(lang => (
                  <button key={lang} onClick={() => { setCurrentLang(lang); setMobileMenuOpen(false); navigate(localizedPath('/stages', lang)); }} className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${currentLang === lang ? 'bg-[#232999] text-white' : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{lang}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className={`relative pt-32 pb-20 px-4 overflow-hidden ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800' : 'bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-50'}`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#232999] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <a href="#calendar-stages" className="px-5 py-2.5 rounded-full text-sm font-bold inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
            ☀️ {currentLang === 'FR' ? 'Stages d\'été 2026 · Inscriptions ouvertes' : currentLang === 'EN' ? 'Summer Camps 2026 · Now enrolling' : 'Sommer-Camps 2026 · Anmeldung offen'}
          </a>
          <h1 className={`text-5xl lg:text-6xl font-bold leading-tight mt-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t.heroTitle1}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#232999] to-indigo-500"> {t.heroTitle2}</span>
          </h1>
          <p className={`text-lg leading-relaxed mt-8 max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.heroDesc}</p>
          <div className={`mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${darkMode ? 'bg-gray-800 text-gray-300 border border-gray-700' : 'bg-white text-gray-700 border border-indigo-100 shadow-sm'}`}>
            <span>🎖️</span>
            <span>{currentLang === 'FR' ? 'Programme conçu par des ingénieurs diplômés' : currentLang === 'EN' ? 'Curriculum designed by engineers from' : 'Lehrplan entwickelt von Ingenieuren der'}</span>
              <img src="/epfl.png" alt="EPFL" className={`h-8 w-auto inline-block ${darkMode ? 'invert' : ''}`} />
              <img src="/ethz.png" alt="ETH Zürich" className={`h-8 w-auto inline-block ${darkMode ? 'invert' : ''}`} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <a href="#calendar-stages" className="bg-[#232999] hover:bg-[#1a1f7a] text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300">{t.heroCta}</a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-12">
            {[t.heroPill1, t.heroPill2, t.heroPill3].map((pill, i) => (
              <div key={i} className="flex items-center gap-2">
                <i className={`ri-checkbox-circle-fill text-xl ${darkMode ? 'text-indigo-400' : 'text-[#232999]'}`}></i>
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{pill}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why ── */}
      <section className={`py-20 px-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#232999] font-semibold text-sm uppercase tracking-wider">{t.whyLabel}</span>
            <h2 className={`text-4xl lg:text-5xl font-bold mt-4 mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.whyTitle}</h2>
            <p className={`text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.whyDesc}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: 'ri-time-line', color: 'from-amber-400 to-orange-400', title: t.why1T, desc: t.why1D },
              { icon: 'ri-graduation-cap-line', color: 'from-[#232999] to-indigo-500', title: t.why2T, desc: t.why2D },
              { icon: 'ri-computer-line', color: 'from-emerald-500 to-teal-500', title: t.why3T, desc: t.why3D },
              { icon: 'ri-group-line', color: 'from-violet-400 to-purple-500', title: t.why4T, desc: t.why4D },
              { icon: 'ri-trophy-line', color: 'from-rose-400 to-pink-500', title: t.why5T, desc: t.why5D },
              { icon: 'ri-pie-chart-line', color: 'from-sky-400 to-cyan-500', title: t.why6T, desc: t.why6D },
            ].map((b, i) => (
              <div key={i} className={`group p-8 rounded-2xl border hover:shadow-lg transition-all duration-300 hover:-translate-y-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'}`}>
                <div className={`w-16 h-16 bg-gradient-to-br ${b.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <i className={`${b.icon} text-3xl text-white`}></i>
                </div>
                <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{b.title}</h3>
                <p className={`leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Formats ── */}
      <section id="formats-stages" className={`py-20 px-4 ${darkMode ? 'bg-gray-950' : 'bg-gradient-to-br from-indigo-50/60 via-slate-50 to-indigo-50/40'}`}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#232999] font-semibold text-sm uppercase tracking-wider">{t.formatsLabel}</span>
            <h2 className={`text-4xl lg:text-5xl font-bold mt-4 mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.formatsTitle}</h2>
            <p className={`text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.formatsDesc}</p>
          </div>
          <div className={`rounded-3xl border-2 overflow-hidden hover:shadow-xl transition-all duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="bg-gradient-to-r from-sky-500 to-blue-500 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">🎓</div>
                <div><h3 className="text-2xl font-bold">{t.format1T}</h3><p className="text-white/80">{t.format1Sub}</p></div>
              </div>
            </div>
            <div className="p-8">
              <div className="flex items-baseline gap-2 mb-8">
                <span className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.format1Price}</span>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.format1PriceSub}</span>
              </div>

              {/* Choix Matin / Après-midi visualisé */}
              <p className={`text-sm font-semibold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentLang === 'FR' ? 'Choix de la session (lors de l\'inscription)' : currentLang === 'EN' ? 'Session choice (at enrollment)' : 'Session-Wahl (bei Anmeldung)'}
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                <div className={`p-4 rounded-2xl border-2 ${darkMode ? 'bg-amber-900/20 border-amber-700/50' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center text-xl">🌅</div>
                    <div>
                      <p className={`font-bold text-sm ${darkMode ? 'text-amber-300' : 'text-amber-900'}`}>{currentLang === 'FR' ? 'Matin' : currentLang === 'EN' ? 'Morning' : 'Morgen'}</p>
                      <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>09h00 – 12h00</p>
                    </div>
                  </div>
                </div>
                <div className={`p-4 rounded-2xl border-2 ${darkMode ? 'bg-indigo-900/20 border-indigo-700/50' : 'bg-indigo-50 border-indigo-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-400 rounded-full flex items-center justify-center text-xl">☀️</div>
                    <div>
                      <p className={`font-bold text-sm ${darkMode ? 'text-indigo-300' : 'text-indigo-900'}`}>{currentLang === 'FR' ? 'Après-midi' : currentLang === 'EN' ? 'Afternoon' : 'Nachmittag'}</p>
                      <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>14h00 – 17h00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inclus */}
              <p className={`text-sm font-semibold uppercase tracking-wider mb-3 mt-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentLang === 'FR' ? 'Inclus' : currentLang === 'EN' ? 'Included' : 'Inbegriffen'}
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">⚡</span>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{t.format1I2}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">🎁</span>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{t.format1I4}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">📜</span>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{currentLang === 'FR' ? 'Certificat de formation officiel remis en fin de stage' : currentLang === 'EN' ? 'Official training certificate at the end of camp' : 'Offizielles Ausbildungszertifikat am Ende des Camps'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">👨‍🏫</span>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{currentLang === 'FR' ? 'Bootcamp conçu par des ingénieurs EPFL & ETHZ' : currentLang === 'EN' ? 'Bootcamp designed by EPFL & ETHZ engineers' : 'Bootcamp von EPFL- & ETHZ-Ingenieuren konzipiert'}</span>
                </li>
              </ul>

              {/* CTA direct : ouvre le formulaire (avant : renvoyait vers un calendrier
                  qui n'a plus qu'une période → incohérent) */}
              <div className="mt-8 text-center">
                <button onClick={() => openStageModal(`${t.period6Title} (${t.period6Dates})`)} className="w-full bg-[#232999] hover:bg-[#1a1f7a] text-white px-8 py-4 rounded-full font-bold transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer">
                  {currentLang === 'FR' ? 'Réserver la place de mon enfant →' : currentLang === 'EN' ? "Book my child's spot →" : 'Platz meines Kindes buchen →'}
                </button>
                <p className={`text-xs mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {currentLang === 'FR' ? 'Sans engagement · Réponse sous 24h' : currentLang === 'EN' ? 'No commitment · Reply within 24h' : 'Unverbindlich · Antwort innert 24h'}
                </p>
              </div>
            </div>
          </div>

          <div className={`mt-8 rounded-2xl p-5 flex items-center justify-center gap-2 text-sm ${darkMode ? 'bg-gray-800/60 text-gray-300' : 'bg-white/80 border border-gray-200 text-gray-700'}`}>
            <i className="ri-discount-percent-line text-emerald-500 text-lg"></i>
            <span>{t.pricingReduc}</span>
          </div>
        </div>
      </section>

      {/* ── Themes ── */}
      <section id="themes-stages" className={`py-20 px-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#232999] font-semibold text-sm uppercase tracking-wider">{t.themesLabel}</span>
            <h2 className={`text-4xl lg:text-5xl font-bold mt-4 mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.themesTitle}</h2>
            <p className={`text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.themesDesc}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {themes.map((theme, i) => (
              <div key={i} className={`group relative p-8 rounded-2xl border overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'}`}>
                <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${theme.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>
                <div className={`w-16 h-16 bg-gradient-to-br ${theme.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <i className={`${theme.icon} text-3xl text-white`}></i>
                </div>
                <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-indigo-50 text-[#232999]'}`}>{theme.tag}</span>
                <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{theme.title}</h3>
                <p className={`leading-relaxed text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{theme.desc}</p>
              </div>
            ))}
          </div>

          {/* ── Aperçu du certificat de fin de stage ── */}
          <div className="mt-14 max-w-xl mx-auto">
            <div className="text-center mb-6">
              <h3 className={`text-2xl lg:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentLang === 'FR' ? 'Un certificat à la fin du stage' : currentLang === 'EN' ? 'A certificate at the end of the camp' : 'Ein Zertifikat am Ende des Camps'}
              </h3>
              <p className={`mt-3 max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentLang === 'FR' ? "Chaque participant repart avec son jeu créé et un certificat officiel signé, à afficher fièrement." : currentLang === 'EN' ? 'Every participant leaves with their own game and an official signed certificate.' : 'Jeder Teilnehmer geht mit seinem eigenen Spiel und einem offiziellen signierten Zertifikat nach Hause.'}
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              <img src="/certificat-exemple-scratch.png" alt="Exemple de certificat de stage Smart Kids School" loading="lazy" className="w-full h-auto block" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Calendar ── */}
      <section id="calendar-stages" className={`py-20 px-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#232999] font-semibold text-sm uppercase tracking-wider">{t.calendarLabel}</span>
            <h2 className={`text-4xl lg:text-5xl font-bold mt-4 mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.calendarTitle}</h2>
            <p className={`text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.calendarDesc}</p>
          </div>

          {/* ── Bandeau ÉTÉ en vedette (changer la période en vedette = modifier ici + featured dans calendar) ── */}
          <div className="mb-10 rounded-3xl overflow-hidden bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 p-1 shadow-xl">
            <div className={`rounded-[1.4rem] p-6 md:p-8 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="text-6xl flex-shrink-0">☀️</div>
                <div className="flex-1 text-center md:text-left">
                  <span className="inline-block bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-2 uppercase tracking-wider">
                    {currentLang === 'FR' ? 'Inscriptions ouvertes' : currentLang === 'EN' ? 'Now enrolling' : 'Anmeldung offen'}
                  </span>
                  <h3 className={`text-2xl md:text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currentLang === 'FR' ? 'Stages d\'été 2026 · Juillet & Août' : currentLang === 'EN' ? 'Summer Camps 2026 · July & August' : 'Sommer-Camps 2026 · Juli & August'}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {currentLang === 'FR' ? '4 demi-journées · Il repart avec son jeu vidéo · 5 enfants max par groupe' : currentLang === 'EN' ? '4 half-days · He leaves with his own video game · 5 children max per group' : '4 Halbtage · Er geht mit seinem eigenen Spiel · Max. 5 Kinder pro Gruppe'}
                  </p>
                  {openWeeksCount > 0 && (
                    <p className="text-sm font-bold text-amber-600 mt-2">
                      <i className="ri-fire-line mr-1"></i>
                      {currentLang === 'FR'
                        ? (openWeeksCount === 1 ? 'Plus qu\'une seule semaine disponible' : `Plus que ${openWeeksCount} semaines disponibles`)
                        : currentLang === 'EN'
                        ? (openWeeksCount === 1 ? 'Only one week left' : `Only ${openWeeksCount} weeks left`)
                        : (openWeeksCount === 1 ? 'Nur noch eine Woche verfügbar' : `Nur noch ${openWeeksCount} Wochen verfügbar`)}
                    </p>
                  )}
                </div>
                <button onClick={() => openStageModal(`${t.period6Title} (${t.period6Dates})`)} className="flex-shrink-0 bg-[#232999] hover:bg-[#1a1f7a] text-white px-7 py-4 rounded-full font-bold transition-all hover:shadow-xl hover:scale-105 cursor-pointer whitespace-nowrap">
                    {currentLang === 'FR' ? 'Réserver ma place' : currentLang === 'EN' ? 'Book my spot' : 'Platz buchen'} →
                  </button>
              </div>
            </div>
          </div>

          {/* Autres périodes : une ligne discrète (les 6 cartes encombraient la page,
              l'été en vedette suffit — remettre une grille quand une autre saison devient active) */}
          <div className={`rounded-2xl border px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left ${darkMode ? 'bg-gray-800/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
            <i className="ri-calendar-2-line text-xl text-[#232999]"></i>
            <span className="text-sm">
              {currentLang === 'FR'
                ? "Des stages ont aussi lieu pendant les vacances d'automne, de Noël, de février et de printemps."
                : currentLang === 'EN'
                ? 'Camps also take place during autumn, Christmas, February and spring holidays.'
                : 'Camps finden auch in den Herbst-, Weihnachts-, Februar- und Frühlingsferien statt.'}
            </span>
            <a href={`mailto:contact@smartkids-school.ch?subject=${encodeURIComponent(currentLang === 'FR' ? 'Être informé des prochains stages (hors été)' : currentLang === 'EN' ? 'Notify me about upcoming camps (outside summer)' : 'Über kommende Camps informiert werden')}`} className="text-sm font-semibold text-[#232999] hover:text-indigo-800 whitespace-nowrap">
              {currentLang === 'FR' ? 'Être informé →' : currentLang === 'EN' ? 'Get notified →' : 'Informiert werden →'}
            </a>
          </div>
          <p className={`text-center text-sm mt-10 max-w-2xl mx-auto ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            <i className="ri-information-line mr-2"></i>{t.calendarNote}
          </p>
        </div>
      </section>

      {/* ── Après le stage : continuité à l'année (entonnoir stage → abonnement) ── */}
      <section className={`py-20 px-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto">
          <div className={`rounded-3xl overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-indigo-100'}`}>
            <div className="bg-gradient-to-br from-[#232999] to-[#1a1f7a] px-8 py-10 text-center text-white">
              <span className="inline-block bg-amber-400 text-[#232999] text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
                {currentLang === 'FR' ? 'Le stage n\'est qu\'un début' : currentLang === 'EN' ? 'The camp is just the beginning' : 'Das Camp ist erst der Anfang'}
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                {currentLang === 'FR' ? 'Après le stage, il continue toute l\'année' : currentLang === 'EN' ? 'After the camp, they keep going all year' : 'Nach dem Camp geht es das ganze Jahr weiter'}
              </h2>
              <p className="text-indigo-100 max-w-2xl mx-auto leading-relaxed">
                {currentLang === 'FR'
                  ? "Smart Kids School est avant tout une école de programmation à l'année. Le stage donne le déclic ; nos cours réguliers transforment cette étincelle en vraie compétence, à son rythme."
                  : currentLang === 'EN'
                  ? 'Smart Kids School is first and foremost a year-round coding school. The camp sparks the interest; our regular classes turn that spark into real skill, at their own pace.'
                  : 'Smart Kids School ist in erster Linie eine ganzjährige Programmierschule. Das Camp weckt das Interesse; unser regulärer Unterricht macht daraus echte Kompetenz.'}
              </p>
            </div>
            <div className={`px-8 py-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {[
                  { icon: 'ri-calendar-check-line', t: { FR: 'Cours hebdomadaires', EN: 'Weekly classes', DE: 'Wöchentlicher Unterricht' }, d: { FR: 'Un rendez-vous régulier qui ancre les acquis, semaine après semaine.', EN: 'A regular session that anchors progress, week after week.', DE: 'Ein regelmässiger Termin, der das Gelernte festigt.' } },
                  { icon: 'ri-route-line', t: { FR: 'Un vrai parcours', EN: 'A real path', DE: 'Ein echter Lernweg' }, d: { FR: 'De Scratch à Python, une progression pensée pour les enfants.', EN: 'From Scratch to Python, a progression designed for kids.', DE: 'Von Scratch bis Python, für Kinder konzipiert.' } },
                  { icon: 'ri-gift-line', t: { FR: 'Offre de continuité', EN: 'Continuity offer', DE: 'Anschlussangebot' }, d: { FR: 'Inscription à l\'année après un stage : le montant du stage est déduit.', EN: 'Enrol for the year after a camp: the camp fee is deducted.', DE: 'Jahresanmeldung nach einem Camp: die Camp-Gebühr wird abgezogen.' } },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-indigo-900/40' : 'bg-indigo-100'}`}>
                      <i className={`${item.icon} text-2xl text-[#232999]`}></i>
                    </div>
                    <h4 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.t[currentLang]}</h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.d[currentLang]}</p>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <a href={lp('/tarifs')} className="inline-block bg-[#232999] hover:bg-[#1a1f7a] text-white font-semibold px-8 py-3.5 rounded-full transition-all hover:shadow-lg">
                  {currentLang === 'FR' ? 'Découvrir les cours à l\'année →' : currentLang === 'EN' ? 'Discover year-round classes →' : 'Ganzjährige Kurse entdecken →'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Partnership ── */}
      <section className={`py-20 px-4 ${darkMode ? 'bg-gray-950' : 'bg-gradient-to-br from-indigo-50/60 via-slate-50 to-indigo-50/40'}`}>
        <div className="max-w-4xl mx-auto">
          <div className={`rounded-3xl p-8 md:p-12 border-2 ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-indigo-500/30' : 'bg-gradient-to-br from-indigo-50 via-white to-amber-50 border-[#232999]/20'}`}>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <a href="https://www.levalentin.ch/" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                <img src="levalentin.jpg" alt="École du Valentin, Lausanne" loading="lazy" className="h-24 w-auto object-contain rounded-2xl bg-white p-3 shadow-md hover:shadow-xl transition-shadow" />
              </a>
              <div className="flex-1 text-center md:text-left">
                <h3 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.partnerTitle}</h3>
                <p className={`leading-relaxed mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.partnerDesc}</p>
                <a href="https://www.levalentin.ch/" target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 font-semibold text-sm transition-colors ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-[#232999] hover:text-indigo-800'}`}>
                  {t.partnerLink}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#232999] via-[#1e2470] to-[#171b54] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">{t.ctaTitle}</h2>
          <p className="text-xl text-white/90 mb-10">{t.ctaDesc}</p>
          <div className="flex justify-center">
            <button onClick={() => openStageModal(`${t.period6Title} (${t.period6Dates})`)} className="bg-white text-[#232999] px-8 py-4 rounded-full font-bold hover:shadow-2xl transform hover:scale-105 transition-all cursor-pointer">{t.ctaBtn}</button>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={`py-20 px-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#232999] font-semibold text-sm uppercase tracking-wider">{(t as any).faqLabel}</span>
            <h2 className={`text-4xl lg:text-5xl font-bold mt-4 mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{(t as any).faqTitle}</h2>
            <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{(t as any).faqDesc}</p>
          </div>
          <div className="space-y-4">
            {(((t as any).faqs ?? []) as { q: string; a: string }[]).map((faq, i) => (
              <div key={i} className={`border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'}`}>
                <button onClick={() => toggleFaq(i)} className="w-full px-8 py-6 text-left flex items-center justify-between gap-4 cursor-pointer">
                  <h3 className={`text-lg font-bold pr-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{faq.q}</h3>
                  <i className={`ri-${openFaq === i ? 'subtract' : 'add'}-line text-2xl text-[#232999] flex-shrink-0`}></i>
                </button>
                {openFaq === i && <div className="px-8 pb-6"><p className={`leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{faq.a}</p></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <Footer currentLang={currentLang} darkMode={darkMode} />
      <CookieBanner currentLang={currentLang} darkMode={darkMode} />

      {/* ── Modal d'inscription stage ── */}
      {showStageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeStageModal}>
          <div className={`rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <div className={`sticky top-0 border-b px-8 py-6 flex items-center justify-between rounded-t-3xl ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div>
                <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentLang === 'FR' ? 'Inscription stage' : currentLang === 'EN' ? 'Camp registration' : 'Camp-Anmeldung'}
                </h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedStagePeriod}</p>
              </div>
              <button onClick={closeStageModal} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {stageSubmitMessage === 'success' ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h4 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentLang === 'FR' ? 'Demande envoyée !' : currentLang === 'EN' ? 'Request sent!' : 'Anfrage gesendet!'}
                </h4>
                <p className={`leading-relaxed mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentLang === 'FR'
                    ? "Merci ! Nous vous recontactons sous 24h pour confirmer la place et procéder au paiement."
                    : currentLang === 'EN'
                    ? "Thanks! We'll get back to you within 24h to confirm the spot and process payment."
                    : 'Danke! Wir melden uns innerhalb von 24h zur Bestätigung und Zahlung.'}
                </p>
                <button onClick={closeStageModal} className="bg-[#232999] hover:bg-[#1a1f7a] text-white px-8 py-3 rounded-full font-semibold transition-all cursor-pointer">
                  {currentLang === 'FR' ? 'Fermer' : currentLang === 'EN' ? 'Close' : 'Schliessen'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleStageSubmit} name="stage-enrollment" data-netlify="true" className="p-8" id="stage-form">
                <input type="hidden" name="form-name" value="stage-enrollment" />
                <input type="hidden" name="period" value={selectedStagePeriod} />

                {/* Période + Prix dynamique */}
                <div className={`mb-6 p-4 rounded-2xl border-2 ${darkMode ? 'bg-indigo-900/20 border-indigo-700' : 'bg-indigo-50 border-indigo-200'}`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-indigo-300' : 'text-[#232999]'}`}>
                        {currentLang === 'FR' ? 'Période demandée' : currentLang === 'EN' ? 'Requested period' : 'Gewünschte Periode'}
                      </p>
                      <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedStagePeriod}</p>
                    </div>
                    <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-[#232999]'}`}>
                      {stageFormData.numChildren === 1 ? '449' : '799'} CHF
                    </p>
                  </div>
                </div>

                {/* Choix de la semaine (affiché si période = été) */}
                {selectedStagePeriod.toLowerCase().includes('été') || selectedStagePeriod.toLowerCase().includes('summer') || selectedStagePeriod.toLowerCase().includes('sommer') ? (
                  <div className="mb-6">
                    <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {currentLang === 'FR' ? 'Quelle semaine souhaitez-vous ? *' : currentLang === 'EN' ? 'Which week would you like? *' : 'Welche Woche möchten Sie? *'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {summerWeeks.map(w => {
                        const closed = w.status !== 'open';
                        return (
                          <button
                            key={w.id}
                            type="button"
                            disabled={closed}
                            onClick={() => !closed && setSelectedWeek(w.label)}
                            className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                              closed
                                ? (darkMode ? 'bg-gray-800/40 border-gray-700 text-gray-600 cursor-not-allowed opacity-60' : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-70')
                                : selectedWeek === w.label
                                  ? (darkMode ? 'bg-indigo-900/30 border-indigo-500 text-white cursor-pointer' : 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-200 text-gray-900 cursor-pointer')
                                  : (darkMode ? 'bg-gray-800 border-gray-600 text-gray-300 hover:border-indigo-700 cursor-pointer' : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-300 cursor-pointer')
                            }`}>
                            {selectedWeek === w.label && !closed && <i className="ri-checkbox-circle-fill text-[#232999] mr-1"></i>}
                            {w.label}
                            {closed && <span className="ml-2 text-[10px] font-bold uppercase tracking-wide bg-gray-300 text-gray-600 px-2 py-0.5 rounded-full">{statusLabel(w.status)}</span>}
                          </button>
                        );
                      })}
                    </div>
                    <input type="hidden" name="selectedWeek" value={selectedWeek} />
                  </div>
                ) : null}
                <div className="mb-6">
                  <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {currentLang === 'FR' ? "Nombre d'enfants à inscrire *" : currentLang === 'EN' ? 'Number of children to enroll *' : 'Anzahl Kinder *'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setStageFormData({ ...stageFormData, numChildren: 1 })}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${stageFormData.numChildren === 1 ? darkMode ? 'bg-indigo-900/30 border-indigo-500' : 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-200' : darkMode ? 'bg-gray-800 border-gray-600 hover:border-indigo-700' : 'bg-white border-gray-300 hover:border-indigo-300'}`}>
                      <div className="text-3xl mb-1">👤</div>
                      <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{currentLang === 'FR' ? '1 enfant' : currentLang === 'EN' ? '1 child' : '1 Kind'}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>449 CHF</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStageFormData({ ...stageFormData, numChildren: 2 })}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${stageFormData.numChildren === 2 ? darkMode ? 'bg-emerald-900/30 border-emerald-500' : 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200' : darkMode ? 'bg-gray-800 border-gray-600 hover:border-emerald-700' : 'bg-white border-gray-300 hover:border-emerald-300'}`}>
                      <div className="text-3xl mb-1">👨‍👩‍👧</div>
                      <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{currentLang === 'FR' ? '2 enfants (-11%)' : currentLang === 'EN' ? '2 children (-11%)' : '2 Kinder (-11%)'}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>799 CHF {currentLang === 'FR' ? '(au lieu de 898, économie 99 CHF)' : currentLang === 'EN' ? '(instead of 898, save 99 CHF)' : '(statt 898, 99 CHF gespart)'}</p>
                    </button>
                  </div>
                </div>

                {/* Parent Info */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="stage-parent" className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {currentLang === 'FR' ? 'Nom du parent *' : currentLang === 'EN' ? "Parent's name *" : 'Name des Elternteils *'}
                    </label>
                    <input id="stage-parent" type="text" name="parentName" value={stageFormData.parentName} onChange={e => setStageFormData({ ...stageFormData, parentName: e.target.value })} required className={`w-full px-4 py-3 rounded-xl border focus:border-[#232999] focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`} />
                  </div>
                  <div>
                    <label htmlFor="stage-email" className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email *</label>
                    <input id="stage-email" type="email" name="email" value={stageFormData.email} onChange={e => setStageFormData({ ...stageFormData, email: e.target.value })} required className={`w-full px-4 py-3 rounded-xl border focus:border-[#232999] focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`} placeholder="votre@email.com" />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="stage-phone" className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {currentLang === 'FR' ? 'Téléphone *' : currentLang === 'EN' ? 'Phone *' : 'Telefon *'}
                  </label>
                  <input id="stage-phone" type="tel" name="phone" value={stageFormData.phone} onChange={e => setStageFormData({ ...stageFormData, phone: e.target.value })} required className={`w-full px-4 py-3 rounded-xl border focus:border-[#232999] focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`} placeholder="+41 XX XXX XX XX" />
                </div>

                {/* Children Info : adapté à 1 ou 2 enfants */}
                <div className={`mb-6 p-5 rounded-2xl border-2 ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-indigo-50/40 border-indigo-200'}`}>
                  <h4 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <span className="text-xl">{stageFormData.numChildren === 1 ? '👤' : '👨‍👩‍👧'}</span>
                    {stageFormData.numChildren === 1
                      ? (currentLang === 'FR' ? "Informations sur l'enfant" : currentLang === 'EN' ? 'Child information' : 'Informationen zum Kind')
                      : (currentLang === 'FR' ? `Informations sur les 2 enfants` : currentLang === 'EN' ? `Information about the 2 children` : `Informationen über die 2 Kinder`)}
                  </h4>
                  <div className="space-y-4">
                    {Array.from({ length: stageFormData.numChildren }).map((_, idx) => (
                      <div key={idx} className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900/50' : 'bg-white'}`}>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-indigo-400' : 'text-[#232999]'}`}>
                          {currentLang === 'FR' ? `Enfant ${idx + 1}` : currentLang === 'EN' ? `Child ${idx + 1}` : `Kind ${idx + 1}`}
                        </p>
                        <div className="grid md:grid-cols-3 gap-3">
                          <div className="md:col-span-2">
                            <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {currentLang === 'FR' ? 'Prénom *' : currentLang === 'EN' ? 'First name *' : 'Vorname *'}
                            </label>
                            <input
                              type="text"
                              value={stageFormData.children[idx].name}
                              onChange={e => {
                                const newChildren = [...stageFormData.children];
                                newChildren[idx] = { ...newChildren[idx], name: e.target.value };
                                setStageFormData({ ...stageFormData, children: newChildren });
                              }}
                              required
                              className={`w-full px-3 py-2 rounded-lg border focus:border-[#232999] focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`}
                            />
                          </div>
                          <div>
                            <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {currentLang === 'FR' ? 'Âge *' : currentLang === 'EN' ? 'Age *' : 'Alter *'}
                            </label>
                            <input
                              type="number"
                              min="6"
                              max="15"
                              value={stageFormData.children[idx].age}
                              onChange={e => {
                                const newChildren = [...stageFormData.children];
                                newChildren[idx] = { ...newChildren[idx], age: e.target.value };
                                setStageFormData({ ...stageFormData, children: newChildren });
                              }}
                              required
                              className={`w-full px-3 py-2 rounded-lg border focus:border-[#232999] focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {stageFormData.numChildren === 2 && (
                    <p className={`text-xs mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <i className="ri-information-line mr-1"></i>
                      {currentLang === 'FR'
                        ? 'Forfait famille : 799 CHF pour les 2 enfants (au lieu de 898 CHF). Économie de 99 CHF sur le total.'
                        : currentLang === 'EN'
                        ? 'Family bundle: 799 CHF for both children (instead of 898 CHF). Save 99 CHF.'
                        : 'Familienpaket: 799 CHF für beide Kinder (statt 898 CHF). 99 CHF gespart.'}
                    </p>
                  )}
                </div>

                {/* Choix Matin / Après-midi */}
                <div className="mb-6">
                  <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {currentLang === 'FR' ? 'Session souhaitée *' : currentLang === 'EN' ? 'Preferred session *' : 'Bevorzugte Session *'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${stageFormData.preferredSession === 'morning' ? darkMode ? 'bg-amber-900/30 border-amber-500' : 'bg-amber-50 border-amber-400 ring-2 ring-amber-200' : darkMode ? 'bg-gray-800 border-gray-600 hover:border-amber-700' : 'bg-white border-gray-300 hover:border-amber-300'}`}>
                      <input type="radio" name="preferredSession" value="morning" checked={stageFormData.preferredSession === 'morning'} onChange={() => setStageFormData({ ...stageFormData, preferredSession: 'morning' })} className="sr-only" required />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center text-xl flex-shrink-0">🌅</div>
                        <div>
                          <p className={`font-bold text-sm ${darkMode ? 'text-amber-300' : 'text-amber-900'}`}>{currentLang === 'FR' ? 'Matin' : currentLang === 'EN' ? 'Morning' : 'Morgen'}</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>09h00 – 12h00</p>
                        </div>
                      </div>
                    </label>
                    <label className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${stageFormData.preferredSession === 'afternoon' ? darkMode ? 'bg-indigo-900/30 border-indigo-500' : 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-200' : darkMode ? 'bg-gray-800 border-gray-600 hover:border-indigo-700' : 'bg-white border-gray-300 hover:border-indigo-300'}`}>
                      <input type="radio" name="preferredSession" value="afternoon" checked={stageFormData.preferredSession === 'afternoon'} onChange={() => setStageFormData({ ...stageFormData, preferredSession: 'afternoon' })} className="sr-only" required />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-400 rounded-full flex items-center justify-center text-xl flex-shrink-0">☀️</div>
                        <div>
                          <p className={`font-bold text-sm ${darkMode ? 'text-indigo-300' : 'text-indigo-900'}`}>{currentLang === 'FR' ? 'Après-midi' : currentLang === 'EN' ? 'Afternoon' : 'Nachmittag'}</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>14h00 – 17h00</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Message optionnel */}
                <div className="mb-6">
                  <label htmlFor="stage-message" className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {currentLang === 'FR' ? 'Thème souhaité ou questions (optionnel)' : currentLang === 'EN' ? 'Preferred theme or questions (optional)' : 'Gewünschtes Thema oder Fragen (optional)'}
                  </label>
                  <textarea id="stage-message" name="message" value={stageFormData.message} onChange={e => setStageFormData({ ...stageFormData, message: e.target.value })} rows={3} className={`w-full px-4 py-3 rounded-xl border focus:border-[#232999] focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`} />
                </div>

                {/* Errors / Status */}
                {stageSubmitMessage === 'error' && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    <i className="ri-error-warning-line mr-1"></i>
                    {currentLang === 'FR' ? "Une erreur est survenue. Merci de nous écrire à contact@smartkids-school.ch ou via WhatsApp." : currentLang === 'EN' ? 'Something went wrong. Please email us or use WhatsApp.' : 'Ein Fehler ist aufgetreten. Bitte E-Mail oder WhatsApp.'}
                  </div>
                )}
                {stageSubmitMessage === 'error_missing_child' && (
                  <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                    <i className="ri-error-warning-line mr-1"></i>
                    {currentLang === 'FR' ? "Merci de remplir le nom et l'âge de chaque enfant." : currentLang === 'EN' ? 'Please fill the name and age of each child.' : 'Bitte Name und Alter jedes Kindes ausfüllen.'}
                  </div>
                )}
                {stageSubmitMessage === 'redirecting' && (
                  <div className="mb-4 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-200 text-emerald-700 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                      <p className="font-bold">
                        {currentLang === 'FR' ? 'Demande enregistrée, Redirection vers le paiement...' : currentLang === 'EN' ? 'Request recorded, Redirecting to payment...' : 'Anfrage erfasst, Weiterleitung zur Zahlung...'}
                      </p>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={stageSubmitting || stageSubmitMessage === 'redirecting'} className="w-full bg-gradient-to-r from-[#232999] to-indigo-600 text-white px-6 py-4 rounded-full font-bold hover:shadow-xl transition-all duration-300 cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed">
                  {stageSubmitting
                    ? (currentLang === 'FR' ? 'Envoi en cours…' : currentLang === 'EN' ? 'Sending…' : 'Wird gesendet…')
                    : `🔒 ${currentLang === 'FR' ? 'Procéder au paiement sécurisé' : currentLang === 'EN' ? 'Proceed to secure payment' : 'Zur sicheren Zahlung'}`}
                </button>

                <p className={`text-xs text-center mt-4 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  <i className="ri-shield-check-line mr-1 text-emerald-500"></i>
                  {currentLang === 'FR' ? 'Paiement sécurisé via Stripe · Garantie satisfait ou remboursé' : currentLang === 'EN' ? 'Secure payment via Stripe · Money-back guarantee' : 'Sichere Zahlung via Stripe · Geld-zurück-Garantie'}
                </p>
              </form>
            )}
          </div>
        </div>
      )}
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

    </div>
  );
}
