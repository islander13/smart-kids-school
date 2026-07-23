import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import CookieBanner from '../components/CookieBanner';
import { parseLocaleFromPath, localizedPath, setHreflangTags } from '../i18n/routing';
import { useEmbeddedCheckout } from '../lib/useEmbeddedCheckout';

type Lang = 'FR' | 'EN' | 'DE';

// Stripe Checkout via Netlify Function (CHF strict, pas d'Adaptive Pricing)
// La création de session se fait dans /.netlify/functions/create-checkout-session

export default function Premium() {
  const [currentLang, setCurrentLang] = useState<Lang>(() => parseLocaleFromPath(window.location.pathname).locale);
  const navigate = useNavigate();
  const lp = (path: string) => localizedPath(path, currentLang);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try { return localStorage.getItem('sks_theme') === 'dark'; } catch { return false; }
  });
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    parentName: '',
    email: '',
    phone: '',
    childName: '',
    childAge: '',
    objectives: '',
    bestTime: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

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
    try { localStorage.setItem('sks_lang', currentLang); } catch {}
    document.documentElement.lang = currentLang.toLowerCase();
    document.title = currentLang === 'FR'
      ? 'Premium, Mentorat individuel | Smart Kids School'
      : currentLang === 'EN'
      ? 'Premium, One-to-one mentoring | Smart Kids School'
      : 'Premium, Einzelmentoring | Smart Kids School';
    const desc = currentLang === 'FR'
      ? "Mentorat individuel avec le fondateur de Smart Kids School. 2 séances par semaine, un vrai projet publié en 12 mois. 3 places par année scolaire."
      : currentLang === 'EN'
      ? 'One-to-one mentoring with the founder of Smart Kids School. 2 sessions a week, a real project published within 12 months. 3 spots per school year.'
      : 'Einzelmentoring mit dem Gründer von Smart Kids School. 2 Sitzungen pro Woche, ein echtes Projekt in 12 Monaten veröffentlicht. 3 Plätze pro Schuljahr.';
    const setMeta = (name: string, content: string, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.content = content;
    };
    setMeta('description', desc);
    setMeta('og:title', document.title, 'property');
    setMeta('og:description', desc, 'property');
    const { basePath } = parseLocaleFromPath(window.location.pathname);
    const isFormDeeplink = basePath.endsWith('/inscription');
    setMeta('og:url', `https://smartkids-school.ch${localizedPath(basePath, currentLang)}`, 'property');
    if (isFormDeeplink) {
      setMeta('robots', 'noindex, follow');
    } else {
      setHreflangTags('/premium', currentLang);
    }

    // Données structurées (Course + offres) : permet à Google d'afficher les
    // prix directement dans les résultats de recherche pour cette page.
    let ldEl = document.querySelector('script[type="application/ld+json"][data-sks="premium"]') as HTMLScriptElement;
    if (!ldEl) {
      ldEl = document.createElement('script');
      ldEl.type = 'application/ld+json';
      ldEl.setAttribute('data-sks', 'premium');
      document.head.appendChild(ldEl);
    }
    ldEl.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: currentLang === 'FR' ? 'Premium — Mentorat individuel' : currentLang === 'EN' ? 'Premium — One-to-one mentoring' : 'Premium — Einzelmentoring',
      description: desc,
      provider: { '@type': 'EducationalOrganization', name: 'Smart Kids School', sameAs: 'https://smartkids-school.ch' },
      offers: [
        {
          '@type': 'Offer',
          name: currentLang === 'FR' ? 'Premium Mensuel' : currentLang === 'EN' ? 'Premium Monthly' : 'Premium Monatlich',
          price: '999',
          priceCurrency: 'CHF',
          priceSpecification: { '@type': 'UnitPriceSpecification', price: '999', priceCurrency: 'CHF', unitCode: 'MON', unitText: currentLang === 'FR' ? 'par mois' : currentLang === 'EN' ? 'per month' : 'pro Monat' },
          url: 'https://smartkids-school.ch' + localizedPath('/premium', currentLang),
        },
        {
          '@type': 'Offer',
          name: currentLang === 'FR' ? 'Premium 12 mois (-10%)' : currentLang === 'EN' ? 'Premium 12 months (-10%)' : 'Premium 12 Monate (-10%)',
          price: '10789',
          priceCurrency: 'CHF',
          url: 'https://smartkids-school.ch' + localizedPath('/premium', currentLang),
        },
      ],
    });
  }, [currentLang]);

  const toggleTheme = useCallback(() => {
    setDarkMode(d => {
      const next = !d;
      try { localStorage.setItem('sks_theme', next ? 'dark' : 'light'); } catch {}
      return next;
    });
  }, []);

  const T = {
    FR: {
      navAccueil: 'Accueil', navTarifs: 'Tarifs', navStages: 'Stages', navFaq: 'FAQ', navBlog: 'Blog',
      navContact: 'Nous contacter',
      heroBadge: '🎓 Mentorat individuel · 3 places par année scolaire',
      heroTitle: "Pour l'enfant qui veut en faire quelque chose",
      heroSubtitle: "Un mentorat individuel avec le fondateur, pour transformer une passion en vraie compétence.",
      heroDesc: "Premium n'est pas un abonnement à des heures de cours. C'est un accompagnement sur 12 mois où votre enfant construit un vrai projet, le publie, et apprend à penser comme un ingénieur — encadré directement par le fondateur.",
      heroPrice: '999',
      heroPriceUnit: 'CHF / mois',
      heroPriceSub: 'Sans engagement · 1er mois satisfait ou remboursé',
      heroCta: 'Découvrir le programme',
      whyTitle: 'Pourquoi Premium ?',
      why1T: 'Un mentor, pas un cours',
      why1D: "Votre enfant travaille directement avec le fondateur, ingénieur EPFL. Pas d'enseignant assigné, pas de curriculum figé : une relation de mentorat qui s'installe dans la durée.",
      why2T: 'Un résultat concret',
      why2D: "En 12 mois, votre enfant conçoit et publie une vraie application ou un vrai jeu, accessible en ligne. Quelque chose qu'il pourra montrer, pas seulement des heures suivies.",
      why3T: 'Une trajectoire',
      why3D: "Préparation aux concours, orientation vers les filières technologiques, bilans trimestriels avec les parents. On ne raisonne pas en séances, mais en années.",
      includedTitle: 'Ce que comprend le mentorat',
      includedDesc: "Un accompagnement complet, pensé pour aller loin.",
      scarcityTitle: '3 places par année scolaire',
      scarcityDesc: "Le mentorat est assuré personnellement par le fondateur. Sa capacité est donc réellement limitée : trois enfants par année scolaire, pas un de plus.",
      notForAllTitle: "Premium n'est pas pour tout le monde",
      notForAllDesc: "Si votre enfant découvre la programmation, la formule Solo à 249 CHF/mois est le bon choix — et nous vous le dirons franchement. Premium s'adresse à l'enfant qui a déjà le déclic : celui qui code de lui-même le week-end, qui pose des questions auxquelles vous ne savez plus répondre, et qui veut aller loin.",
      notForAllCta: 'Voir la formule Solo →',
      guaranteeTitle: 'Premier mois satisfait ou remboursé',
      guaranteeDesc: "Si après un mois le mentorat ne correspond pas à vos attentes, nous vous remboursons intégralement. Sans discussion.",
      inc: [
        { icon: '🎓', title: 'Un mentor unique : le fondateur', desc: "Votre enfant travaille directement avec le fondateur, ingénieur EPFL. Pas d'enseignant assigné, pas de rotation : le même mentor toute l'année." },
        { icon: '🚀', title: 'Un vrai projet publié', desc: "En 12 mois, votre enfant conçoit, développe et met en ligne une application ou un jeu accessible publiquement. Un résultat qu'il pourra montrer et faire évoluer." },
        { icon: '🏆', title: 'Préparation aux concours', desc: "Olympiades suisses d'informatique, hackathons juniors : nous préparons votre enfant s'il souhaite se mesurer aux meilleurs." },
        { icon: '📈', title: 'Bilan trimestriel avec les parents', desc: "Tous les trois mois, 30 minutes d'échange sur les progrès, les forces de votre enfant et les pistes d'orientation." },
        { icon: '📅', title: '2 séances par semaine', desc: "Deux séances individuelles d'une heure, avec créneaux prioritaires entre 9h et 19h. Soit environ 8 séances par mois." },
        { icon: '💬', title: 'Accès direct au fondateur', desc: "WhatsApp privé pour toutes vos questions. Réponse garantie dans les 24h ouvrables." },
        { icon: '🎬', title: 'Bilan vidéo mensuel', desc: "Chaque mois, une vidéo personnalisée qui détaille les progrès et les projets réalisés par votre enfant." },
        { icon: '🏖️', title: '2 stages de vacances offerts', desc: "Deux stages inclus dans votre abonnement annuel (valeur 898 CHF)." },
      ],
      pricingTitle: 'Choisissez votre formule',
      pricingDesc: "Deux options pour s'adapter à vos préférences.",
      planMonthlyTitle: 'Premium Mensuel',
      planMonthlyPrice: '999',
      planMonthlyUnit: 'CHF / mois',
      planMonthlySub: 'Sans engagement',
      planMonthlyDesc: 'La flexibilité maximale. Annulable à tout moment.',
      planYearlyTitle: 'Premium 12 mois (-10%)',
      planYearlyPrice: '10\'789',
      planYearlyUnit: 'CHF',
      planYearlySub: 'Paiement total · 1199 CHF économisés',
      planYearlyDesc: "L'engagement de l'excellence sur une année complète.",
      planYearlyMonthly: 'Soit 899 CHF/mois équivalent',
      pricingBadge: '🎁 -10% économie',
      pricingCta: "Démarrer l'inscription Premium",
      faqTitle: 'Questions fréquentes',
      faqs: [
        { q: 'Quelle est la différence avec Solo classique ?', a: "Solo (dès 249 CHF/mois) inclut 4 séances par mois et un programme standard, avec un enseignant formé à notre méthode. Premium (999 CHF/mois) est un mentorat direct avec le fondateur : 2 séances par semaine, un vrai projet publié en 12 mois, la préparation aux concours, des bilans trimestriels avec vous, et 2 stages offerts par an. Solo enseigne le code ; Premium construit une trajectoire." },
        { q: 'Combien de places Premium sont disponibles ?', a: "Le mentorat étant assuré personnellement par le fondateur, nous limitons l'offre Premium à 3 enfants par année scolaire. Une fois ces places remplies, nous ouvrons une liste d'attente pour l'année suivante." },
        { q: 'Puis-je upgrader depuis Solo ?', a: "Oui, sous réserve d'une place disponible parmi les 3 places annuelles. Le mois en cours sera prorata, et le passage est immédiat dès qu'une place se libère." },
        { q: 'Que se passe-t-il si je veux arrêter ?', a: "L'offre Premium Mensuel (999 CHF/mois) est annulable à tout moment, sans questions. L'offre Premium 12 mois (avec -10%) est un paiement unique : aucune annulation possible avant la fin de la période, mais la garantie 1ère séance reste valable (remboursement intégral possible si insatisfait après la 1ère séance)." },
        { q: 'Comment se passe le diagnostic initial ?', a: "Avant de démarrer, nous organisons une visioconférence de 30 minutes avec votre enfant et vous (parents). Nous évaluons son niveau, ses centres d'intérêt, ses objectifs, pour bâtir un programme sur-mesure." },
        { q: 'Les stages offerts sont-ils obligatoires ?', a: "Non, ils sont inclus en cadeau mais vous êtes libre de ne pas les utiliser. Aucun remboursement n'est appliqué si vous choisissez de ne pas y participer." },
      ],
      modalTitle: 'Inscription Premium',
      modalSubtitle: "Remplissez ce formulaire, nous vous recontactons sous 24h pour planifier votre diagnostic initial avant le démarrage.",
      formParent: 'Nom et prénom du parent',
      formEmail: 'Email',
      formPhone: 'Téléphone',
      formChild: "Prénom de l'enfant",
      formChildAge: "Âge de l'enfant",
      formObjectives: 'Quels sont vos objectifs prioritaires pour votre enfant ?',
      formBestTime: 'Meilleurs créneaux pour le diagnostic initial (30 min)',
      formSubmit: 'Procéder au paiement sécurisé',
      formSecure: 'Paiement sécurisé via Stripe · Garantie 1ère séance',
      submitError: 'Une erreur est survenue. Merci de nous écrire à contact@smartkids-school.ch',
      ctaQuestionsTitle: 'Une question avant de vous engager ?',
      ctaQuestionsDesc: "Nous comprenons. Le Premium est un investissement important. Réservez un appel de 15 min avec le fondateur pour discuter de votre situation.",
      ctaQuestionsBtn: 'Discuter avec le fondateur',
    },
    EN: {
      navAccueil: 'Home', navTarifs: 'Pricing', navStages: 'Camps', navFaq: 'FAQ', navBlog: 'Blog',
      navContact: 'Contact us',
      heroBadge: '🎓 One-to-one mentoring · 3 spots per school year',
      heroTitle: 'For the child who wants to build something',
      heroSubtitle: 'One-to-one mentoring with the founder, turning a passion into a real skill.',
      heroDesc: "Premium isn't a subscription to lesson hours. It's a 12-month journey where your child builds a real project, publishes it, and learns to think like an engineer — mentored directly by the founder.",
      heroPrice: '999',
      heroPriceUnit: 'CHF / month',
      heroPriceSub: 'No commitment · First month money-back guarantee',
      heroCta: 'Discover the program',
      whyTitle: 'Why Premium?',
      why1T: 'A mentor, not a class',
      why1D: 'Your child works directly with the founder, an EPFL engineer. No assigned teacher, no fixed curriculum: a mentoring relationship that grows over time.',
      why2T: 'A concrete result',
      why2D: 'In 12 months, your child designs and publishes a real app or game, live online. Something they can show, not just hours attended.',
      why3T: 'A trajectory',
      why3D: 'Competition prep, guidance toward tech pathways, quarterly reviews with parents. We think in years, not sessions.',
      includedTitle: 'What the mentoring includes',
      includedDesc: 'A complete programme, built to go far.',
      scarcityTitle: '3 spots per school year',
      scarcityDesc: 'The mentoring is delivered personally by the founder. Capacity is therefore genuinely limited: three children per school year, no more.',
      notForAllTitle: 'Premium is not for everyone',
      notForAllDesc: "If your child is discovering coding, the Solo plan at CHF 249/month is the right choice — and we'll tell you so honestly. Premium is for the child who already has the spark: the one who codes on weekends, asks questions you can no longer answer, and wants to go far.",
      notForAllCta: 'See the Solo plan →',
      guaranteeTitle: 'First month money-back guarantee',
      guaranteeDesc: "If after one month the mentoring doesn't meet your expectations, we refund you in full. No questions asked.",
      inc: [
        { icon: '🎓', title: 'One mentor: the founder', desc: 'Your child works directly with the founder, an EPFL engineer. No assigned teacher, no rotation: the same mentor all year.' },
        { icon: '🚀', title: 'A real published project', desc: 'Over 12 months, your child designs, builds and puts online an app or game anyone can access. A result they can show and keep improving.' },
        { icon: '🏆', title: 'Competition preparation', desc: 'Swiss Informatics Olympiad, junior hackathons: we prepare your child if they want to measure up against the best.' },
        { icon: '📈', title: 'Quarterly review with parents', desc: 'Every three months, 30 minutes on progress, your child\'s strengths, and pathway options.' },
        { icon: '📅', title: '2 sessions per week', desc: 'Two one-hour one-to-one sessions, with priority slots between 9am and 7pm. Around 8 sessions a month.' },
        { icon: '💬', title: 'Direct access to the founder', desc: 'Private WhatsApp for all your questions. Guaranteed reply within 24 working hours.' },
        { icon: '🎬', title: 'Monthly video report', desc: 'Each month, a personalised video detailing the progress and projects achieved by your child.' },
        { icon: '🏖️', title: '2 holiday camps included', desc: 'Two camps included in your annual subscription (value CHF 898).' },
      ],
      pricingTitle: 'Choose your plan',
      pricingDesc: 'Two options to fit your preferences.',
      planMonthlyTitle: 'Premium Monthly',
      planMonthlyPrice: '999',
      planMonthlyUnit: 'CHF / month',
      planMonthlySub: 'No commitment',
      planMonthlyDesc: 'Maximum flexibility. Cancel anytime.',
      planYearlyTitle: 'Premium 12 months (-10%)',
      planYearlyPrice: '10,789',
      planYearlyUnit: 'CHF',
      planYearlySub: 'Total payment · 1199 CHF saved',
      planYearlyDesc: 'A full-year commitment to excellence.',
      planYearlyMonthly: 'Equivalent to 899 CHF/month',
      pricingBadge: '🎁 -10% saving',
      pricingCta: 'Start Premium enrollment',
      faqTitle: 'Frequently asked questions',
      faqs: [
        { q: 'How is it different from standard Solo?', a: "Solo (from CHF 249/month) includes 4 sessions a month and a standard programme, with a teacher trained in our method. Premium (CHF 999/month) is direct mentoring with the founder: 2 sessions a week, a real project published within 12 months, competition preparation, quarterly reviews with you, and 2 camps included per year. Solo teaches coding; Premium builds a trajectory." },
        { q: 'How many Premium spots are available?', a: 'Since the mentoring is delivered personally by the founder, we limit Premium to 3 children per school year. Once full, we open a waiting list for the following year.' },
        { q: 'Can I upgrade from Solo?', a: 'Yes, subject to a spot being available among the 3 yearly places. The current month will be prorated, and the change happens as soon as a spot opens up.' },
        { q: 'What if I want to stop?', a: 'Premium Monthly (999 CHF/month) is cancellable anytime, no questions asked. Premium 12 months (with -10%) is a one-time payment: no cancellation before the end of the period, but the 1st-session guarantee remains valid (full refund if dissatisfied after 1st session).' },
        { q: 'How does the initial diagnosis work?', a: 'Before starting, we organize a 30-minute video call with your child and you (parents). We assess their level, interests, and objectives to build a custom program.' },
        { q: 'Are the offered camps mandatory?', a: 'No, they are included as a gift but you are free not to use them. No refund applies if you choose not to participate.' },
      ],
      modalTitle: 'Premium enrollment',
      modalSubtitle: 'Fill in this form, we get back to you within 24h to schedule your initial diagnosis before starting.',
      formParent: 'Parent full name',
      formEmail: 'Email',
      formPhone: 'Phone',
      formChild: "Child's first name",
      formChildAge: "Child's age",
      formObjectives: 'What are your priority objectives for your child?',
      formBestTime: 'Best time slots for the initial diagnosis (30 min)',
      formSubmit: 'Proceed to secure payment',
      formSecure: 'Secure payment via Stripe · 1st-session guarantee',
      submitError: 'An error occurred. Please email contact@smartkids-school.ch',
      ctaQuestionsTitle: 'A question before committing?',
      ctaQuestionsDesc: 'We understand. Premium is a significant investment. Book a 15-min call with the founder to discuss your situation.',
      ctaQuestionsBtn: 'Talk with the founder',
    },
    DE: {
      navAccueil: 'Startseite', navTarifs: 'Preise', navStages: 'Camps', navFaq: 'FAQ', navBlog: 'Blog',
      navContact: 'Kontakt',
      heroBadge: '🎓 Einzelmentoring · 3 Plätze pro Schuljahr',
      heroTitle: 'Für das Kind, das etwas daraus machen will',
      heroSubtitle: 'Einzelmentoring mit dem Gründer, das aus einer Leidenschaft echtes Können macht.',
      heroDesc: 'Premium ist kein Abo für Unterrichtsstunden. Es ist eine 12-monatige Begleitung, in der Ihr Kind ein echtes Projekt baut, es veröffentlicht und lernt, wie ein Ingenieur zu denken — direkt vom Gründer betreut.',
      heroPrice: '999',
      heroPriceUnit: 'CHF / Monat',
      heroPriceSub: 'Ohne Bindung · Erster Monat mit Geld-zurück-Garantie',
      heroCta: 'Programm entdecken',
      whyTitle: 'Warum Premium?',
      why1T: 'Ein Mentor, kein Kurs',
      why1D: 'Ihr Kind arbeitet direkt mit dem Gründer, einem EPFL-Ingenieur. Kein zugewiesener Lehrer, kein starres Curriculum: eine Mentoring-Beziehung, die über die Zeit wächst.',
      why2T: 'Ein konkretes Ergebnis',
      why2D: 'In 12 Monaten entwirft und veröffentlicht Ihr Kind eine echte App oder ein echtes Spiel, online zugänglich. Etwas, das es zeigen kann — nicht nur besuchte Stunden.',
      why3T: 'Ein Werdegang',
      why3D: 'Wettbewerbsvorbereitung, Orientierung Richtung Tech-Studiengänge, vierteljährliche Gespräche mit den Eltern. Wir denken in Jahren, nicht in Sitzungen.',
      includedTitle: 'Was das Mentoring umfasst',
      includedDesc: 'Eine vollständige Begleitung, gebaut um weit zu kommen.',
      scarcityTitle: '3 Plätze pro Schuljahr',
      scarcityDesc: 'Das Mentoring wird persönlich vom Gründer durchgeführt. Die Kapazität ist daher tatsächlich begrenzt: drei Kinder pro Schuljahr, nicht mehr.',
      notForAllTitle: 'Premium ist nicht für alle',
      notForAllDesc: 'Wenn Ihr Kind das Programmieren gerade entdeckt, ist die Solo-Formel für 249 CHF/Monat die richtige Wahl — und wir sagen Ihnen das ehrlich. Premium ist für das Kind, das den Funken schon hat: das am Wochenende von selbst programmiert und weit kommen will.',
      notForAllCta: 'Solo-Formel ansehen →',
      guaranteeTitle: 'Erster Monat mit Geld-zurück-Garantie',
      guaranteeDesc: 'Wenn das Mentoring nach einem Monat nicht Ihren Erwartungen entspricht, erstatten wir Ihnen den vollen Betrag. Ohne Diskussion.',
      inc: [
        { icon: '🎓', title: 'Ein Mentor: der Gründer', desc: 'Ihr Kind arbeitet direkt mit dem Gründer, einem EPFL-Ingenieur. Kein zugewiesener Lehrer, kein Wechsel: derselbe Mentor das ganze Jahr.' },
        { icon: '🚀', title: 'Ein echtes veröffentlichtes Projekt', desc: 'In 12 Monaten entwirft, entwickelt und veröffentlicht Ihr Kind eine App oder ein Spiel, für alle zugänglich.' },
        { icon: '🏆', title: 'Wettbewerbsvorbereitung', desc: 'Schweizer Informatik-Olympiade, Junior-Hackathons: Wir bereiten Ihr Kind vor, wenn es sich mit den Besten messen möchte.' },
        { icon: '📈', title: 'Vierteljährliches Elterngespräch', desc: 'Alle drei Monate 30 Minuten über Fortschritte, Stärken Ihres Kindes und Orientierungsmöglichkeiten.' },
        { icon: '📅', title: '2 Sitzungen pro Woche', desc: 'Zwei Einzelsitzungen à einer Stunde, mit prioritären Zeitfenstern zwischen 9 und 19 Uhr. Rund 8 Sitzungen im Monat.' },
        { icon: '💬', title: 'Direkter Zugang zum Gründer', desc: 'Privates WhatsApp für alle Ihre Fragen. Antwort innerhalb von 24 Werkstunden garantiert.' },
        { icon: '🎬', title: 'Monatlicher Videobericht', desc: 'Jeden Monat ein personalisiertes Video mit den Fortschritten und Projekten Ihres Kindes.' },
        { icon: '🏖️', title: '2 Ferien-Camps inklusive', desc: 'Zwei Camps sind in Ihrem Jahresabo enthalten (Wert 898 CHF).' },
      ],
      pricingTitle: 'Wählen Sie Ihr Paket',
      pricingDesc: 'Zwei Optionen für Ihre Präferenzen.',
      planMonthlyTitle: 'Premium Monatlich',
      planMonthlyPrice: '999',
      planMonthlyUnit: 'CHF / Monat',
      planMonthlySub: 'Ohne Bindung',
      planMonthlyDesc: 'Maximale Flexibilität. Jederzeit kündbar.',
      planYearlyTitle: 'Premium 12 Monate (-10%)',
      planYearlyPrice: "10'789",
      planYearlyUnit: 'CHF',
      planYearlySub: 'Gesamtzahlung · 1199 CHF gespart',
      planYearlyDesc: 'Das ganzjährige Engagement für Exzellenz.',
      planYearlyMonthly: 'Entspricht 899 CHF/Monat',
      pricingBadge: '🎁 -10% Ersparnis',
      pricingCta: 'Premium-Anmeldung starten',
      faqTitle: 'Häufige Fragen',
      faqs: [
        { q: 'Was ist der Unterschied zum klassischen Solo?', a: 'Solo (ab 249 CHF/Monat) umfasst 4 Sitzungen pro Monat und ein Standardprogramm mit einer in unserer Methode ausgebildeten Lehrperson. Premium (999 CHF/Monat) ist direktes Mentoring mit dem Gründer: 2 Sitzungen pro Woche, ein echtes Projekt in 12 Monaten veröffentlicht, Wettbewerbsvorbereitung, vierteljährliche Gespräche mit Ihnen und 2 Camps pro Jahr inklusive. Solo lehrt Programmieren; Premium baut einen Werdegang.' },
        { q: 'Wie viele Premium-Plätze sind verfügbar?', a: 'Da das Mentoring persönlich vom Gründer durchgeführt wird, beschränken wir Premium auf 3 Kinder pro Schuljahr. Ist es voll, eröffnen wir eine Warteliste für das folgende Jahr.' },
        { q: 'Kann ich von Solo upgraden?', a: 'Ja, sofern einer der 3 Jahresplätze frei ist. Der laufende Monat wird anteilig berechnet, der Wechsel erfolgt sobald ein Platz frei wird.' },
        { q: 'Was, wenn ich aufhören möchte?', a: 'Premium Monatlich (999 CHF/Monat) jederzeit kündbar. Premium 12 Monate (-10%) ist eine Einmalzahlung: keine Kündigung vor Periodenende, aber die 1.-Sitzung-Garantie gilt (volle Rückerstattung bei Unzufriedenheit nach 1. Sitzung).' },
        { q: 'Wie läuft die Erstdiagnose?', a: 'Vor dem Start organisieren wir eine 30-minütige Videokonferenz mit Ihrem Kind und Ihnen. Wir bewerten Niveau, Interessen und Ziele.' },
        { q: 'Sind die angebotenen Camps obligatorisch?', a: 'Nein, sie sind als Geschenk inklusive, aber Sie können sie auch nicht nutzen. Keine Rückerstattung bei Nichtteilnahme.' },
      ],
      modalTitle: 'Premium-Anmeldung',
      modalSubtitle: 'Füllen Sie dieses Formular aus, wir melden uns innerhalb von 24h zur Planung Ihrer Erstdiagnose vor dem Start.',
      formParent: 'Vor- und Nachname Elternteil',
      formEmail: 'E-Mail',
      formPhone: 'Telefon',
      formChild: 'Vorname des Kindes',
      formChildAge: 'Alter des Kindes',
      formObjectives: 'Was sind Ihre prioritären Ziele für Ihr Kind?',
      formBestTime: 'Beste Zeitfenster für die Erstdiagnose (30 Min)',
      formSubmit: 'Zur sicheren Zahlung',
      formSecure: 'Sichere Zahlung via Stripe · 1.-Sitzung-Garantie',
      submitError: 'Ein Fehler ist aufgetreten. Bitte schreiben Sie an contact@smartkids-school.ch',
      ctaQuestionsTitle: 'Eine Frage vor der Verpflichtung?',
      ctaQuestionsDesc: 'Wir verstehen. Premium ist eine bedeutende Investition. Buchen Sie ein 15-min Gespräch mit dem Gründer.',
      ctaQuestionsBtn: 'Mit dem Gründer sprechen',
    },
  } as const;

  const t = T[currentLang];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage('');
    try {
      // ─── 1. Soumettre à Netlify ───
      const fd = new FormData();
      fd.append('form-name', 'premium-enrollment');
      fd.append('plan', selectedPlan === 'monthly' ? 'Premium Mensuel (999 CHF/mois)' : 'Premium 12 mois (10789 CHF total)');
      fd.append('parentName', formData.parentName);
      fd.append('email', formData.email);
      fd.append('phone', formData.phone);
      fd.append('childName', formData.childName);
      fd.append('childAge', formData.childAge);
      fd.append('objectives', formData.objectives);
      fd.append('bestTime', formData.bestTime);

      const netlifyRes = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(fd as any).toString(),
      });

      if (!netlifyRes.ok) {
        setSubmitMessage('error');
        return;
      }

      try { (window as any).gtag?.('event', 'premium_enrollment', { plan: selectedPlan }); } catch {}

      // ─── 2. Créer la session Stripe Checkout (CHF strict) ───
      setSubmitMessage('redirecting');

      const productKey = selectedPlan === 'monthly' ? 'premium-monthly' : 'premium-yearly';

      const checkoutRes = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productKey: productKey,
          customerEmail: formData.email,
          metadata: {
            parentName: formData.parentName,
            phone: formData.phone,
            childName: formData.childName,
            childAge: formData.childAge,
            objectives: formData.objectives,
            bestTime: formData.bestTime,
          },
        }),
      });

      if (!checkoutRes.ok) {
        const err = await checkoutRes.json();
        console.error('Checkout error:', err);
        setSubmitMessage('error');
        return;
      }

      const { clientSecret } = await checkoutRes.json();
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

  const checkout = useEmbeddedCheckout();

  const openPremiumModal = (plan: 'monthly' | 'yearly') => {
    setSelectedPlan(plan);
    setSubmitMessage('');
    checkout.reset();
    setShowModal(true);
    // Nettoie l'URL (efface tout #ancre résiduel) et pointe vers le lien
    // partageable du formulaire, pour que copier la barre d'adresse à ce
    // moment-là redonne toujours un lien direct et propre.
    navigate(localizedPath('/premium/inscription', currentLang), { replace: true });
  };

  const closeModal = () => {
    setShowModal(false);
    setSubmitMessage('');
    checkout.reset();
    const { basePath } = parseLocaleFromPath(window.location.pathname);
    if (basePath === '/premium/inscription') {
      navigate(localizedPath('/premium', currentLang), { replace: true });
    }
  };

  // ESC pour fermer
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape' && showModal) closeModal(); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [showModal]);

  const lockBody = showModal;
  useEffect(() => {
    document.body.style.overflow = lockBody ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lockBody]);

  // Lien direct vers le formulaire (ex: /premium/inscription) : ouvre la modal
  // automatiquement avec la formule mensuelle présélectionnée.
  useEffect(() => {
    const { basePath } = parseLocaleFromPath(window.location.pathname);
    if (basePath === '/premium/inscription') {
      openPremiumModal('monthly');
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
              <a href={lp('/')}><img src="/Logo_official_dark.png" alt="Smart Kids School" width="192" height="64" className="h-16 w-auto" /></a>
              <img src="/flag-ch.png" alt="Drapeau de la Suisse" width="24" height="24" className="h-6 w-auto flex-shrink-0 shadow-sm rounded-sm" />
            </div>
            <div className="hidden md:flex items-center space-x-8 ml-8">
              <a href={lp('/')} className={`text-sm font-medium transition-colors whitespace-nowrap ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.navAccueil}</a>
              <a href={lp('/tarifs')} className={`text-sm font-medium transition-colors whitespace-nowrap ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.navTarifs}</a>
              <a href={lp('/stages')} className={`text-sm font-medium transition-colors whitespace-nowrap ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.navStages}</a>
              <a href={lp('/faq')} className={`text-sm font-medium transition-colors whitespace-nowrap ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.navFaq}</a>
              <a href={lp('/blog')} className={`text-sm font-medium transition-colors whitespace-nowrap ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.navBlog}</a>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button onClick={toggleTheme} aria-label="Toggle theme" className={`p-2 rounded-full transition-colors cursor-pointer ${darkMode ? 'text-yellow-400 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}>
                <i className={darkMode ? 'ri-sun-line text-lg' : 'ri-moon-line text-lg'}></i>
              </button>
              <div className="relative">
                <button onClick={() => setShowLangDropdown(!showLangDropdown)} className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors cursor-pointer ${darkMode ? 'border-gray-600 hover:border-indigo-400 text-gray-300' : 'border-gray-200 hover:border-indigo-400 text-gray-700'}`}>
                  <span className="text-sm font-medium">{currentLang}</span>
                  <i className={`ri-arrow-down-s-line transition-transform ${showLangDropdown ? 'rotate-180' : ''} ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}></i>
                </button>
                {showLangDropdown && (
                  <div className={`absolute right-0 mt-2 w-32 rounded-lg shadow-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    {(['FR', 'EN', 'DE'] as Lang[]).map(lang => (
                      <button key={lang} onClick={() => { setCurrentLang(lang); setShowLangDropdown(false); navigate(localizedPath('/premium', lang)); }}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${currentLang === lang ? (darkMode ? 'bg-gray-700 text-white' : 'bg-indigo-50 text-[#232999]') : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')}`}>
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
              <a href={lp('/')} onClick={() => setMobileMenuOpen(false)} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.navAccueil}</a>
              <a href={lp('/tarifs')} onClick={() => setMobileMenuOpen(false)} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.navTarifs}</a>
              <a href={lp('/stages')} onClick={() => setMobileMenuOpen(false)} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.navStages}</a>
              <a href={lp('/faq')} onClick={() => setMobileMenuOpen(false)} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.navFaq}</a>
              <a href={lp('/blog')} onClick={() => setMobileMenuOpen(false)} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.navBlog}</a>
              <div className="flex gap-2 py-2">
                {(['FR', 'EN', 'DE'] as Lang[]).map(lang => (
                  <button key={lang} onClick={() => { setCurrentLang(lang); setMobileMenuOpen(false); navigate(localizedPath('/premium', lang)); }} className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${currentLang === lang ? 'bg-[#232999] text-white' : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{lang}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero Premium ── */}
      <section className={`pt-32 pb-20 px-4 relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-gray-950 via-indigo-950/30 to-gray-950' : 'bg-gradient-to-br from-indigo-50 via-amber-50/40 to-white'}`}>
        {/* Décor : éléments dorés discrets */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-amber-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl"></div>

        <div className="max-w-5xl mx-auto relative">
          <div className="text-center">
            <span className={`inline-block px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase mb-6 ${darkMode ? 'bg-amber-900/30 text-amber-300 border border-amber-700/50' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
              {t.heroBadge}
            </span>
            <h1 className={`text-5xl md:text-6xl font-bold mb-4 leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.heroTitle}
            </h1>
            <p className={`text-xl md:text-2xl mb-3 font-light ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
              {t.heroSubtitle}
            </p>
            <p className={`text-lg max-w-3xl mx-auto leading-relaxed mb-10 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t.heroDesc}
            </p>

            <div className={`inline-block rounded-3xl p-8 border-2 ${darkMode ? 'bg-gray-900/80 border-amber-700/50' : 'bg-white border-amber-200 shadow-2xl'}`}>
              <div className="flex items-baseline gap-2 justify-center mb-2">
                <span className={`text-6xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.heroPrice}</span>
                <span className={`text-xl font-semibold ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>{t.heroPriceUnit}</span>
              </div>
              <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.heroPriceSub}</p>
              <button onClick={() => openPremiumModal('monthly')}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-10 py-4 rounded-full font-bold text-lg transition-all hover:shadow-2xl hover:scale-105 cursor-pointer">
                {t.heroCta} →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pourquoi Premium ── */}
      <section className={`py-20 px-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-5xl mx-auto">
          <h2 className={`text-3xl md:text-4xl font-bold text-center mb-16 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t.whyTitle}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[{ t: t.why1T, d: t.why1D, e: '🚀' }, { t: t.why2T, d: t.why2D, e: '🎯' }, { t: t.why3T, d: t.why3D, e: '👨‍🎓' }].map((it, i) => (
              <div key={i} className={`p-8 rounded-3xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-amber-50/30 to-white border-gray-200 shadow-md'}`}>
                <div className="text-5xl mb-4">{it.e}</div>
                <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{it.t}</h3>
                <p className={`leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{it.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Inclusions ── */}
      <section className={`py-20 px-4 ${darkMode ? 'bg-gray-950' : 'bg-gradient-to-br from-indigo-50/40 via-white to-amber-50/30'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.includedTitle}
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.includedDesc}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {(t.inc ?? []).map((item, i) => (
              <div key={i} className={`flex gap-4 p-6 rounded-2xl border ${darkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="text-3xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h4 className={`font-bold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.title}</h4>
                  <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rareté + "pas pour tout le monde" (avant le prix : on justifie, puis on annonce) ── */}
      <section className={`py-20 px-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Rareté — 3 places, et c'est vrai : la capacité réelle du fondateur */}
          <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#232999] to-[#14175e] px-8 py-10 text-center text-white">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-3xl font-bold mb-3">{t.scarcityTitle}</h3>
            <p className="text-indigo-100 max-w-2xl mx-auto leading-relaxed">{t.scarcityDesc}</p>
          </div>

          {/* Dire à qui ce n'est PAS destiné → crédibilité et désir */}
          <div className={`rounded-3xl border px-8 py-8 ${darkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-amber-50/60 border-amber-200'}`}>
            <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <i className="ri-information-line mr-2 text-amber-500"></i>{t.notForAllTitle}
            </h3>
            <p className={`leading-relaxed mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.notForAllDesc}</p>
            <a href={lp('/tarifs')} className={`text-sm font-semibold ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-[#232999] hover:text-indigo-800'}`}>
              {t.notForAllCta}
            </a>
          </div>

          {/* Garantie — c'est ce qui débloque une décision à 999 CHF */}
          <div className={`rounded-3xl border px-8 py-8 flex flex-col sm:flex-row items-center gap-5 ${darkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-emerald-50/60 border-emerald-200'}`}>
            <div className="text-5xl flex-shrink-0">🛡️</div>
            <div className="text-center sm:text-left">
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.guaranteeTitle}</h3>
              <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.guaranteeDesc}</p>
            </div>
          </div>

        </div>
      </section>

      {/* ── Pricing ── */}
      <section className={`py-20 px-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.pricingTitle}
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.pricingDesc}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Plan Mensuel */}
            <div className={`relative rounded-3xl p-8 border-2 transition-all hover:shadow-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.planMonthlyTitle}</h3>
              <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.planMonthlyDesc}</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className={`text-5xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.planMonthlyPrice}</span>
                <span className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.planMonthlyUnit}</span>
              </div>
              <p className={`text-xs uppercase tracking-wider font-semibold mb-6 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{t.planMonthlySub}</p>
              <button onClick={() => openPremiumModal('monthly')}
                className={`w-full py-3 rounded-full font-bold transition-all cursor-pointer ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}>
                {t.pricingCta}
              </button>
            </div>

            {/* Plan 12 mois (mis en avant) */}
            <div className={`relative rounded-3xl p-8 border-2 transition-all hover:shadow-2xl ${darkMode ? 'bg-gradient-to-br from-amber-900/20 to-gray-800 border-amber-500' : 'bg-gradient-to-br from-amber-50 to-white border-amber-400 shadow-xl'}`}>
              <span className={`absolute -top-3 right-6 px-4 py-1 rounded-full text-xs font-bold ${darkMode ? 'bg-amber-500 text-gray-900' : 'bg-amber-500 text-white'}`}>
                {t.pricingBadge}
              </span>
              <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.planYearlyTitle}</h3>
              <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.planYearlyDesc}</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className={`text-5xl font-black ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>−10%</span>
                <span className={`text-base font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {currentLang === 'FR' ? "sur l'année" : currentLang === 'EN' ? 'on the year' : 'auf das Jahr'}
                </span>
              </div>
              <p className={`text-sm ${darkMode ? 'text-amber-300' : 'text-amber-700'} font-semibold mb-1`}>
                {currentLang === 'FR' ? 'Engagement 12 mois · 1 paiement' : currentLang === 'EN' ? '12-month commitment · 1 payment' : '12-Monats-Bindung · 1 Zahlung'}
              </p>
              <p className={`text-xs mb-6 italic ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {currentLang === 'FR' ? 'Détail tarifaire au moment du paiement' : currentLang === 'EN' ? 'Full pricing details at checkout' : 'Volle Preisangaben beim Checkout'}
              </p>
              <button onClick={() => openPremiumModal('yearly')}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3 rounded-full font-bold transition-all hover:shadow-lg cursor-pointer">
                {t.pricingCta}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={`py-20 px-4 ${darkMode ? 'bg-gray-950' : 'bg-gradient-to-br from-gray-50 to-white'}`}>
        <div className="max-w-3xl mx-auto">
          <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t.faqTitle}
          </h2>
          <div className="space-y-4">
            {(t.faqs ?? []).map((faq, i) => (
              <details key={i} className={`group rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden`}>
                <summary className="cursor-pointer p-6 flex justify-between items-center font-semibold text-lg list-none">
                  <span className={darkMode ? 'text-white' : 'text-gray-900'}>{faq.q}</span>
                  <i className="ri-arrow-down-s-line text-2xl group-open:rotate-180 transition-transform text-amber-600"></i>
                </summary>
                <div className={`px-6 pb-6 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Question ── */}
      <section className={`py-20 px-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-3xl mx-auto text-center">
          <div className={`rounded-3xl p-10 ${darkMode ? 'bg-gradient-to-br from-indigo-900/30 to-gray-800 border border-indigo-700' : 'bg-gradient-to-br from-indigo-50 to-amber-50/30 border border-indigo-200'}`}>
            <div className="text-5xl mb-4">💬</div>
            <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.ctaQuestionsTitle}
            </h2>
            <p className={`mb-8 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.ctaQuestionsDesc}</p>
            <a href="https://wa.me/41774768492" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white px-8 py-4 rounded-full font-bold transition-all hover:shadow-xl hover:scale-105">
              <i className="ri-whatsapp-line text-xl"></i>{t.ctaQuestionsBtn}
            </a>
          </div>
        </div>
      </section>

      {/* ── Modal d'inscription Premium ── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm p-4 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className={`relative w-full max-w-2xl mx-auto my-8 rounded-3xl shadow-2xl ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`}>
            <button onClick={closeModal} aria-label="Close modal" className={`absolute top-4 right-4 p-2 rounded-full z-10 cursor-pointer ${darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}>
              <i className="ri-close-line text-2xl"></i>
            </button>

            {submitMessage === 'embedded' ? (
              <div className="p-4 sm:p-8">
                {!checkout.isReady && (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {currentLang === 'FR' ? 'Chargement du paiement sécurisé…' : currentLang === 'EN' ? 'Loading secure payment…' : 'Sichere Zahlung wird geladen…'}
                    </p>
                  </div>
                )}
                <div ref={checkout.containerRef} className={checkout.isReady ? '' : 'invisible h-0 overflow-hidden'} />
              </div>
            ) : (
              <form onSubmit={handleSubmit} name="premium-enrollment" data-netlify="true" className="p-8">
                <input type="hidden" name="form-name" value="premium-enrollment" />
                <input type="hidden" name="plan" value={selectedPlan} />

                <div className="mb-6">
                  <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.modalTitle}</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.modalSubtitle}</p>
                </div>

                <div className={`mb-6 p-4 rounded-2xl border-2 ${darkMode ? 'bg-amber-900/20 border-amber-700' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                        {currentLang === 'FR' ? 'Formule choisie' : currentLang === 'EN' ? 'Plan selected' : 'Gewähltes Paket'}
                      </p>
                      <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedPlan === 'monthly' ? t.planMonthlyTitle : t.planYearlyTitle}
                      </p>
                    </div>
                    <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-amber-700'}`}>
                      {selectedPlan === 'monthly' ? `${t.planMonthlyPrice} ${t.planMonthlyUnit}` : `${t.planYearlyPrice} ${t.planYearlyUnit}`}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.formParent} *</label>
                    <input type="text" name="parentName" value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} required className={`w-full px-4 py-3 rounded-xl border focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`} />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.formEmail} *</label>
                    <input type="email" name="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className={`w-full px-4 py-3 rounded-xl border focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.formPhone} *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required placeholder="+41 XX XXX XX XX" className={`w-full px-4 py-3 rounded-xl border focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`} />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.formChildAge} *</label>
                    <input type="number" name="childAge" value={formData.childAge} onChange={e => setFormData({...formData, childAge: e.target.value})} required min="6" max="17" className={`w-full px-4 py-3 rounded-xl border focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`} />
                  </div>
                </div>

                <div className="mb-4">
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.formChild} *</label>
                  <input type="text" name="childName" value={formData.childName} onChange={e => setFormData({...formData, childName: e.target.value})} required className={`w-full px-4 py-3 rounded-xl border focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`} />
                </div>

                <div className="mb-4">
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.formObjectives}</label>
                  <textarea name="objectives" value={formData.objectives} onChange={e => setFormData({...formData, objectives: e.target.value})} rows={3} className={`w-full px-4 py-3 rounded-xl border focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`} />
                </div>

                <div className="mb-6">
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.formBestTime}</label>
                  <input type="text" name="bestTime" value={formData.bestTime} onChange={e => setFormData({...formData, bestTime: e.target.value})} placeholder={currentLang === 'FR' ? 'Ex : mardi 18h, samedi matin...' : currentLang === 'EN' ? 'E.g.: Tue 6pm, Sat morning...' : 'z.B.: Di 18h, Sa morgens...'} className={`w-full px-4 py-3 rounded-xl border focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`} />
                </div>

                {submitMessage === 'error' && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    <i className="ri-error-warning-line mr-1"></i>{t.submitError}
                  </div>
                )}

                <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-4 rounded-full font-bold transition-all hover:shadow-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                  {submitting ? (currentLang === 'FR' ? 'Envoi…' : 'Sending…') : `🔒 ${t.formSubmit}`}
                </button>

                <p className={`text-xs text-center mt-4 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  <i className="ri-shield-check-line mr-1 text-emerald-500"></i>{t.formSecure}
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Footer (aligné sur home.tsx) ── */}
      <Footer currentLang={currentLang} darkMode={darkMode} />
      <CookieBanner currentLang={currentLang} darkMode={darkMode} />
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
