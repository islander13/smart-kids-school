import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import CookieBanner from '../components/CookieBanner';
import { parseLocaleFromPath, localizedPath, setHreflangTags } from '../i18n/routing';

type Lang = 'FR' | 'EN' | 'DE';
type FormatKey = 'solo' | 'duo';
type EngagementKey = 'm3' | 'm6' | 'm12';

// ─── Translations ────────────────────────────────────────────────────────────
const T = {
  FR: {
    nav: { home: 'Accueil', tarifs: 'Tarifs', premium: 'Premium', stages: 'Stages', programme: 'Programme', faq: 'FAQ', enroll: 'Inscrire mon enfant' },
    heroBadge: 'Tarifs',
    heroTitle: 'Choisissez votre formule',
    heroPill1: '100% en ligne',
    heroPill2: 'Engagement et abonnement au choix',
    heroPill3: 'Garantie satisfait ou remboursé',

    // How it works
    howLabel: 'Comment ça marche',
    howTitle: 'Apprendre seul ou en duo',
    howDesc: "Le cours se donne en solo ou en duo, deux enfants (frères, sœurs ou amis). À deux, la dynamique est plus motivante, et le tarif baisse pour la famille.",
    how1T: 'Solo',
    how1Sub: '1 enfant',
    how1Desc: 'Cours 100% personnalisé, en tête-à-tête avec le professeur, rythme et programme adaptés à votre enfant.',
    how2T: 'Duo',
    how2Sub: '2 enfants',
    how2Desc: "Votre enfant apprend avec un frère, une sœur ou un ami. Tarif par enfant réduit, émulation et collaboration.",
    howNote: 'Pour 3 enfants ou plus, contactez-nous pour un devis sur-mesure.',

    // Format selector
    selectorLabel: 'Choisissez votre formule',
    selectorTitle: 'Tarifs détaillés',
    selectorDesc: 'Sélectionnez la taille du groupe puis l\'engagement qui vous convient.',
    formatSolo: 'Solo · 1 enfant',
    formatDuo: 'Duo · 2 enfants',

    // Engagement options
    engFlex: 'Sans engagement',
    engFlexSub: 'Mois par mois',
    eng3: '3 mois',
    eng3Sub: 'Engagement court',
    eng6: '6 mois',
    eng6Sub: 'Le plus populaire',
    eng12: '12 mois',
    eng12Sub: 'Parcours complet',

    perMonth: '/ mois',
    perChild: 'par enfant',
    save: 'Économie',
    chf: 'CHF',
    sessionsPerMonth: 'séances de 1h par mois',
    sessionsTotal: 'séances de 1h au total',
    fourSessions: '4 séances',
    twelveSessions: '12 séances',
    twentyfour: '24 séances',
    fortyeight: '48 séances',
    cancel: 'Résiliable à tout moment',
    accessFor: 'Accès garanti',
    threeMonths: '3 mois',
    sixMonths: '6 mois',
    twelveMonths: '12 mois',

    // CTA
    chooseThis: 'Choisir cette formule',
    mostPopular: '⭐ Le plus choisi',
    bestValue: '🎁 Meilleure valeur',

    // Add-ons section
    extrasLabel: 'Autres formules',
    extrasTitle: 'Pas prêt pour un abonnement ?',


    packT: 'Pack 5 séances',
    packP: '419 CHF',
    packPSub: '(soit 84 CHF la séance)',
    packD: 'Cinq séances individuelles à utiliser sur 3 mois. La flexibilité maximale, sans abonnement à gérer. Idéal si vous voulez tester un niveau précis.',
    packCta: 'Acheter le pack',

    stagesT: 'Stages vacances',
    stagesP: 'dès 419 CHF',
    stagesPSub: '(la semaine)',
    stagesD: 'Stages intensifs en ligne pendant les vacances scolaires de Suisse romande. Cinq matinées ou journées complètes pour un projet abouti.',
    stagesCta: 'Voir le calendrier',

    // What's included
    incLabel: 'Tout ce qui est inclus',
    incTitle: 'Un seul prix, tout compris',
    inc1: 'Horaires à la carte, de 9h à 19h : vous choisissez vos créneaux',
    inc2: 'Approche neuropédagogique adaptée à chaque enfant',
    inc3: 'Méthode 100% interactive et créative',
    inc4: "Suivi individuel et bilan d'étape",
    inc5: 'Certificat de formation à la fin de chaque niveau',
    inc6: 'Accompagnement et points réguliers avec les parents',
    inc7: 'Reprogrammation gratuite avec préavis de 24h',
    inc8: 'Tarifs préférentiels pour les stages de vacances',

    // Guarantee
    guaranteeLabel: 'Notre engagement',
    guaranteeTitle: 'Satisfait ou remboursé après la 1ère séance',
    guaranteeDesc: "Nous savons que choisir un cours pour son enfant est important. Si après la première séance vous estimez que SKS ne convient pas, nous vous remboursons intégralement. Sans question, sans paperasse.",

    // Compare table
    compareLabel: 'Tableau comparatif',
    compareTitle: 'Toutes les formules en un coup d\'œil',
    rowFormat: 'Format',
    rowFormatV1: 'Solo uniquement',
    rowFormatV2: 'Solo · Duo',
    rowFormatV3: 'Solo · Duo',
    rowDuration: 'Durée',
    rowDurationV1: '1 séance',
    rowDurationV2: '5 séances · 3 mois',
    rowDurationV3: 'À partir de 1 mois',
    rowFlex: 'Flexibilité',
    rowFlexV1: 'Maximum',
    rowFlexV2: 'Élevée',
    rowFlexV3: 'Variable selon engagement',
    rowDisc: 'Économies',
    rowDiscV1: '–',
    rowDiscV2: '6%',
    rowDiscV3: 'Jusqu\'à 28%',
    rowProg: 'Suivi de progression',
    rowProgV1: 'Bilan oral',
    rowProgV2: 'Bilan écrit',
    rowProgV3: 'Suivi continu',

    // Payment
    paymentLabel: 'Paiement',
    paymentTitle: 'Paiement simple et sécurisé',
    paymentDesc: 'Vous pouvez régler votre formule de différentes façons.',
    pay1T: 'Carte bancaire',
    pay1D: 'Visa, Mastercard, Apple Pay et Google Pay. Le paiement le plus rapide. Pour les abonnements, prélèvement automatique mensuel.',
    pay2T: 'Virement bancaire',
    pay2D: "Pour les engagements de 3, 6 ou 12 mois, vous pouvez régler par virement bancaire suisse (CHF). Idéal pour un paiement annuel d'un coup.",
    pay3T: 'Paiement en plusieurs fois',
    pay3D: "Sur demande, possibilité d'étaler un engagement long en deux ou trois mensualités sans frais.",


    // CTA
    ctaTitle: 'Prêt à offrir un parcours complet à votre enfant ?',
    ctaDesc: "Choisissez la formule qui correspond à votre famille et donnez-lui les compétences du futur.",
    ctaBtn: 'Inscrire mon enfant',
    ctaBtn2: 'Nous contacter',
    faqLabel: 'Questions fréquentes',
    faqTitle: 'Vos questions sur nos tarifs',
    faqDesc: "Tout ce qu'il faut savoir sur nos formules et engagements.",
    faqs: [
      { q: "À quels horaires les cours ont-ils lieu ?", a: "Vous choisissez : nous sommes ouverts de 9h à 19h et fixons ensemble le créneau qui vous convient (après l'école, le mercredi, le week-end). Le rythme aussi s'adapte à votre enfant, c'est tout l'intérêt d'un cours personnalisé." },
      { q: "Comment fonctionnent les formules Solo et Duo ?", a: "L'enfant peut suivre le cours en Solo (cours individuel) ou en Duo avec un frère, une sœur ou un ami. Les tarifs les plus avantageux, soit 249 CHF/mois en Solo et 169 CHF/mois par enfant en Duo, correspondent à l'engagement 12 mois, qui couvre le programme de base de programmation éducative avant la spécialisation. Le tarif baisse en Duo car le cours est mutualisé. Pour 3 enfants ou plus, contactez-nous pour un devis sur-mesure." },
      { q: "Quelle est la différence entre les engagements 3, 6 et 12 mois ?", a: "Plus l'engagement est long, plus le tarif mensuel baisse (jusqu'à -17% sur 12 mois). L'engagement minimum est de 3 mois (la durée d'un module complet) pour que votre enfant aille au bout de son apprentissage. Tous les engagements incluent les mêmes contenus et la garantie 1ère séance." },
      { q: "Que comprend la 'Garantie 1ère séance' ?", a: "Si après la première séance vous n'êtes pas convaincu, nous vous remboursons intégralement, sans poser de question. C'est notre engagement pour que vous testiez sans risque." },
      { q: "Et si je veux changer de niveau d'engagement ?", a: "Vous pouvez à tout moment passer à un engagement plus long (par exemple de 3 à 6 ou 12 mois) pour bénéficier d'un tarif plus avantageux. Le sens inverse n'est pas possible avant la fin de la période d'engagement souscrite." },
      { q: "Quels moyens de paiement acceptez-vous ?", a: "Carte bancaire (Visa, Mastercard, Apple Pay, Google Pay), virement bancaire, et paiement en plusieurs fois. Tous les paiements sont sécurisés via Stripe." },
      { q: "Puis-je annuler mon abonnement ?", a: "L'abonnement court jusqu'à la fin de la période choisie (3, 6 ou 12 mois), puis se renouvelle automatiquement et reste annulable à tout moment ensuite." },
      { q: "Y a-t-il des frais cachés ?", a: "Non. Le prix affiché est tout compris : cours, plateforme, certificat, ressources. Aucun frais d'inscription, aucune surprise." },
    ],
  },
  EN: {
    nav: { home: 'Home', tarifs: 'Pricing', premium: 'Premium', stages: 'Camps', programme: 'Program', faq: 'FAQ', enroll: 'Enroll my child' },
    heroBadge: 'Pricing',
    heroTitle: 'Choose your plan',
    heroPill1: '100% online',
    heroPill2: 'Choose your commitment',
    heroPill3: 'Money-back guarantee',

    howLabel: 'How it works',
    howTitle: 'Learn alone or in pairs',
    howDesc: 'Lessons can be one-on-one or in pairs (two children: siblings or friends). In pairs, the energy is more motivating, and the price drops for the family.',
    how1T: 'Solo', how1Sub: '1 child', how1Desc: "Fully personalised one-on-one class, pace and program adapted to your child.",
    how2T: 'Duo', how2Sub: '2 children', how2Desc: "Your child learns with a sibling or friend. Reduced per-child price, healthy emulation and collaboration.",

    howNote: 'For 3 children or more, contact us for a tailored quote.',

    selectorLabel: 'Choose your plan',
    selectorTitle: 'Detailed pricing',
    selectorDesc: 'Pick group size, then the commitment that fits you.',
    formatSolo: 'Solo · 1 child', formatDuo: 'Duo · 2 children',

    engFlex: 'No commitment', engFlexSub: 'Month-to-month',
    eng3: '3 months', eng3Sub: 'Short commitment',
    eng6: '6 months', eng6Sub: 'Most popular',
    eng12: '12 months', eng12Sub: 'Full path',

    perMonth: '/ month', perChild: 'per child', save: 'Save', chf: 'CHF',
    sessionsPerMonth: '1h sessions per month', sessionsTotal: '1h sessions total',
    fourSessions: '4 sessions', twelveSessions: '12 sessions', twentyfour: '24 sessions', fortyeight: '48 sessions',
    cancel: 'Cancel anytime', accessFor: 'Access guaranteed for',
    threeMonths: '3 months', sixMonths: '6 months', twelveMonths: '12 months',
    chooseThis: 'Choose this plan', mostPopular: '⭐ Most chosen', bestValue: '🎁 Best value',

    extrasLabel: 'Other options', extrasTitle: 'Not ready for a subscription?',
    packT: '5-session pack', packP: 'CHF 419', packPSub: '(CHF 84 per session)',
    packD: 'Five one-on-one sessions to use over 3 months. Maximum flexibility, no subscription. Ideal to test a specific level.',
    packCta: 'Buy the pack',
    stagesT: 'Vacation camps', stagesP: 'from CHF 419', stagesPSub: '(per week)',
    stagesD: 'Intensive online camps during Swiss school holidays. Five mornings or full days to complete a project.',
    stagesCta: 'See calendar',

    incLabel: 'Everything included', incTitle: 'One price, everything included',
    inc1: 'Flexible hours, 9am to 7pm: you pick your time slots',
    inc2: 'Neuropedagogy-based approach for each child',
    inc3: '100% interactive and creative method',
    inc4: 'Individual follow-up and progress reports',
    inc5: 'Training certificate at the end of each level',
    inc6: 'Regular support and check-ins with parents',
    inc7: 'Free rescheduling with 24h notice',
    inc8: 'Preferential rates for vacation camps',

    guaranteeLabel: 'Our promise', guaranteeTitle: 'Money-back after the 1st session',
    guaranteeDesc: "Choosing a class for your child matters. If after the first session you feel SKS isn't right, we refund you in full. No questions, no paperwork.",

    compareLabel: 'Comparison', compareTitle: 'All plans at a glance',
    rowFormat: 'Format', rowFormatV1: 'Solo only', rowFormatV2: 'Solo · Duo', rowFormatV3: 'Solo · Duo',
    rowDuration: 'Duration', rowDurationV1: '1 session', rowDurationV2: '5 sessions · 3 months', rowDurationV3: 'From 1 month',
    rowFlex: 'Flexibility', rowFlexV1: 'Maximum', rowFlexV2: 'High', rowFlexV3: 'Depends on commitment',
    rowDisc: 'Savings', rowDiscV1: '–', rowDiscV2: '6%', rowDiscV3: 'Up to 28%',
    rowProg: 'Progress tracking', rowProgV1: 'Verbal feedback', rowProgV2: 'Written report', rowProgV3: 'Continuous',

    paymentLabel: 'Payment', paymentTitle: 'Simple and secure payment',
    paymentDesc: 'You can pay your plan in several ways.',
    pay1T: 'Credit card', pay1D: 'Visa, Mastercard, Apple Pay and Google Pay. Fastest. For subscriptions, automatic monthly debit.',
    pay2T: 'Bank transfer', pay2D: 'For 3, 6 or 12-month commitments, you can pay by Swiss bank transfer (CHF). Ideal for an annual one-shot payment.',
    pay3T: 'Instalments', pay3D: 'On request, long commitments can be split into 2 or 3 instalments at no cost.',


    ctaTitle: 'Ready to give your child a complete path?',
    ctaDesc: 'Pick the plan that fits your family and give them the skills of the future.',
    ctaBtn: 'Enroll my child', ctaBtn2: 'Contact us',
    faqLabel: 'Frequently asked questions',
    faqTitle: 'Your questions about our pricing',
    faqs: [
      { q: "What times are the lessons held?", a: "You choose: we're open from 9am to 7pm and agree together on a slot that works for you (after school, Wednesday, the weekend). The pace adapts to your child too, that's the whole point of a personalised course." },
      { q: "How do Solo and Duo plans work?", a: "The child can take the class Solo (individual) or in Duo with a sibling or friend. The best rates, namely 249 CHF/month Solo and 169 CHF/month per child in Duo, correspond to the 12-month commitment, which covers the core educational programming curriculum before specialization. The rate drops in Duo because the class is shared. For 3 or more children, contact us for a custom quote." },
      { q: "What's the difference between the 3, 6 and 12 month commitments?", a: "The longer the commitment, the lower the monthly rate (up to -17% over 12 months). The minimum commitment is 3 months (the length of a full module) so your child completes their learning journey. All commitments include the same content and the 1st-session guarantee." },
      { q: "What is the '1st session guarantee'?", a: "If you're not convinced after the first session, we fully refund you, no questions asked." },
      { q: "Can I switch commitment levels?", a: "You can switch to a longer commitment anytime (for example from 3 to 6 or 12 months) to benefit from a better rate. The opposite is not possible before the end of the subscribed period." },
      { q: "Which payment methods do you accept?", a: "Credit card (Visa, Mastercard, Apple Pay, Google Pay), bank transfer, and instalments. All payments are secured via Stripe." },
      { q: "Can I cancel my subscription?", a: "The subscription runs until the end of the chosen period (3, 6 or 12 months), then renews automatically and remains cancellable anytime after." },
      { q: "Are there hidden fees?", a: "No. The price is all-inclusive: classes, platform, certificate, resources. No registration fees, no surprises." },
    ],
  },
  DE: {
    nav: { home: 'Startseite', tarifs: 'Preise', premium: 'Premium', stages: 'Camps', programme: 'Programm', faq: 'FAQ', enroll: 'Kind anmelden' },
    heroBadge: 'Preise',
    heroTitle: 'Wählen Sie Ihre Formel',
    heroPill1: '100% online',
    heroPill2: 'Engagement frei wählbar',
    heroPill3: 'Geld-zurück-Garantie',

    howLabel: 'So funktioniert es', howTitle: 'Allein oder zu zweit lernen',
    howDesc: 'Der Unterricht findet einzeln oder zu zweit statt (zwei Kinder: Geschwister oder Freunde). Zu zweit ist die Dynamik motivierender, und der Preis sinkt für die Familie.',
    how1T: 'Solo', how1Sub: '1 Kind', how1Desc: 'Vollständig personalisierter Einzelunterricht, Tempo und Programm an Ihr Kind angepasst.',
    how2T: 'Duo', how2Sub: '2 Kinder', how2Desc: 'Ihr Kind lernt mit einem Geschwister oder Freund. Reduzierter Preis pro Kind, gesunde Konkurrenz und Zusammenarbeit.',

    howNote: 'Für 3 Kinder oder mehr, kontaktieren Sie uns für ein massgeschneidertes Angebot.',

    selectorLabel: 'Wählen Sie Ihr Abo', selectorTitle: 'Detaillierte Preise',
    selectorDesc: 'Gruppengrösse wählen, dann das passende Engagement.',
    formatSolo: 'Solo · 1 Kind', formatDuo: 'Duo · 2 Kinder',

    engFlex: 'Ohne Bindung', engFlexSub: 'Monatlich',
    eng3: '3 Monate', eng3Sub: 'Kurze Bindung',
    eng6: '6 Monate', eng6Sub: 'Am beliebtesten',
    eng12: '12 Monate', eng12Sub: 'Vollständiger Weg',

    perMonth: '/ Monat', perChild: 'pro Kind', save: 'Ersparnis', chf: 'CHF',
    sessionsPerMonth: 'Sitzungen à 1h pro Monat', sessionsTotal: 'Sitzungen à 1h gesamt',
    fourSessions: '4 Sitzungen', twelveSessions: '12 Sitzungen', twentyfour: '24 Sitzungen', fortyeight: '48 Sitzungen',
    cancel: 'Jederzeit kündbar', accessFor: 'Zugang garantiert für',
    threeMonths: '3 Monate', sixMonths: '6 Monate', twelveMonths: '12 Monate',
    chooseThis: 'Diese Formel wählen', mostPopular: '⭐ Am häufigsten gewählt', bestValue: '🎁 Bestes Angebot',

    extrasLabel: 'Andere Optionen', extrasTitle: 'Noch nicht bereit für ein Abo?',
    packT: '5er-Paket', packP: 'CHF 419', packPSub: '(84 CHF/Sitzung)',
    packD: 'Fünf Einzelsitzungen über 3 Monate verteilt. Maximale Flexibilität, kein Abo.',
    packCta: 'Paket kaufen',
    stagesT: 'Ferien-Camps', stagesP: 'ab CHF 419', stagesPSub: '(pro Woche)',
    stagesD: 'Intensive Online-Camps während der Schweizer Schulferien. Fünf Vormittage oder ganze Tage.',
    stagesCta: 'Kalender ansehen',

    incLabel: 'Alles inklusive', incTitle: 'Ein Preis, alles inklusive',
    inc1: 'Flexible Zeiten von 9 bis 19 Uhr: Sie wählen Ihre Zeitfenster',
    inc2: 'Neuropädagogischer Ansatz, individuell angepasst',
    inc3: '100% interaktive und kreative Methode',
    inc4: 'Individuelle Begleitung und Berichte',
    inc5: 'Ausbildungszertifikat am Ende jedes Niveaus',
    inc6: 'Regelmässige Begleitung und Austausch mit den Eltern',
    inc7: 'Kostenlose Verschiebung mit 24h-Vorlauf',
    inc8: 'Vorzugspreise für Ferien-Camps',

    guaranteeLabel: 'Unser Versprechen', guaranteeTitle: 'Geld zurück nach der 1. Sitzung',
    guaranteeDesc: 'Wenn SKS nach der ersten Sitzung nicht passt, erstatten wir den vollen Betrag. Ohne Fragen, ohne Papierkram.',

    compareLabel: 'Vergleich', compareTitle: 'Alle Formeln auf einen Blick',
    rowFormat: 'Format', rowFormatV1: 'Nur Solo', rowFormatV2: 'Solo · Duo', rowFormatV3: 'Solo · Duo',
    rowDuration: 'Dauer', rowDurationV1: '1 Sitzung', rowDurationV2: '5 Sitzungen · 3 Monate', rowDurationV3: 'Ab 1 Monat',
    rowFlex: 'Flexibilität', rowFlexV1: 'Maximum', rowFlexV2: 'Hoch', rowFlexV3: 'Je nach Bindung',
    rowDisc: 'Ersparnis', rowDiscV1: '–', rowDiscV2: '6%', rowDiscV3: 'Bis zu 28%',
    rowProg: 'Fortschritt', rowProgV1: 'Mündlich', rowProgV2: 'Bericht', rowProgV3: 'Laufend',

    paymentLabel: 'Zahlung', paymentTitle: 'Einfach und sicher zahlen',
    paymentDesc: 'Sie können Ihre Formel auf verschiedene Arten zahlen.',
    pay1T: 'Kreditkarte', pay1D: 'Visa, Mastercard, Apple Pay und Google Pay. Schnellste Methode.',
    pay2T: 'Banküberweisung', pay2D: 'Für 3, 6 oder 12 Monate per Schweizer Banküberweisung (CHF) möglich.',
    pay3T: 'Ratenzahlung', pay3D: 'Auf Anfrage, lange Bindungen in 2 oder 3 Raten kostenlos.',


    ctaTitle: 'Bereit, Ihrem Kind einen vollständigen Weg zu geben?',
    ctaDesc: 'Wählen Sie die passende Formel und geben Sie Ihrem Kind die Fähigkeiten der Zukunft.',
    ctaBtn: 'Kind anmelden', ctaBtn2: 'Kontakt',
    faqLabel: 'Häufige Fragen',
    faqTitle: 'Ihre Fragen zu unseren Preisen',
    faqs: [
      { q: "Zu welchen Zeiten findet der Unterricht statt?", a: "Sie entscheiden: Wir sind von 9 bis 19 Uhr offen und legen gemeinsam einen passenden Termin fest (nach der Schule, mittwochs, am Wochenende). Auch das Tempo richtet sich nach Ihrem Kind, genau das macht personalisierten Unterricht aus." },
      { q: "Wie funktionieren Solo und Duo?", a: "Das Kind kann den Kurs solo oder im Duo mit einem Geschwister oder Freund besuchen. Die besten Tarife, nämlich 249 CHF/Monat Solo und 169 CHF/Monat pro Kind im Duo, entsprechen der 12-Monats-Bindung, die das grundlegende Programm der pädagogischen Programmierung vor der Spezialisierung abdeckt. Der Tarif sinkt im Duo, da der Kurs geteilt wird. Für 3 Kinder oder mehr kontaktieren Sie uns für ein individuelles Angebot." },
      { q: "Unterschied zwischen 3, 6 und 12 Monaten?", a: "Je länger die Bindung, desto niedriger der Monatspreis (bis zu -17% über 12 Monate). Die Mindestbindung beträgt 3 Monate (die Dauer eines vollständigen Moduls), damit Ihr Kind seinen Lernweg abschliesst. Alle Bindungen enthalten dieselben Inhalte und die 1.-Sitzung-Garantie." },
      { q: "Was ist die '1.-Sitzung-Garantie'?", a: "Wenn Sie nach der ersten Sitzung nicht überzeugt sind, erstatten wir den vollen Betrag, ohne Fragen." },
      { q: "Kann ich die Bindung ändern?", a: "Sie können jederzeit zu einer längeren Bindung wechseln (z. B. von 3 zu 6 oder 12 Monaten), um von einem besseren Tarif zu profitieren. Umgekehrt erst am Ende der gebuchten Periode." },
      { q: "Welche Zahlungsmethoden?", a: "Kreditkarte (Visa, Mastercard, Apple Pay, Google Pay), Banküberweisung, Ratenzahlung. Sicher über Stripe." },
      { q: "Kann ich kündigen?", a: "Das Abo läuft bis zum Ende der gewählten Periode (3, 6 oder 12 Monate), verlängert sich dann automatisch und bleibt danach jederzeit kündbar." },
      { q: "Versteckte Gebühren?", a: "Nein. Der Preis ist alles inklusive, keine Anmeldegebühren, keine Überraschungen." },
    ],
  },
};

// ════════════════════════════════════════════════════════════════════════════
// PRICING OPTION A : engagement minimum 3 mois, plus de "Sans engagement"
// Solo : 3m=299  ·  6m=269 (-10%)  ·  12m=249 (-17%)
// Duo  : 3m=398  ·  6m=358 (-10%)  ·  12m=338 (-15%)
// ════════════════════════════════════════════════════════════════════════════
const PRICES: Record<FormatKey, Record<EngagementKey, number>> = {
  solo: { m3: 299, m6: 269, m12: 249 },
  duo:  { m3: 398, m6: 358, m12: 338 },  // 199/179/169 par enfant
};

// Prix par enfant (pour affichage clarté)
const PRICES_PAR_ENFANT: Record<FormatKey, Record<EngagementKey, number>> = {
  solo: { m3: 299, m6: 269, m12: 249 },
  duo:  { m3: 199, m6: 179, m12: 169 },
};

// Prix PAIEMENT EN UNE FOIS : total remisé d'environ 10% (prix finissant par 9)
// Doivent correspondre EXACTEMENT au catalogue PRODUCTS de create-checkout-session.js
const PRICES_ONCE: Record<FormatKey, Record<EngagementKey, number>> = {
  solo: { m3: 799,  m6: 1449, m12: 2689 },
  duo:  { m3: 1079, m6: 1929, m12: 3649 },
};

// Référence pour calculer les économies vs 3 mois (le palier d'entrée)
const REFERENCE: Record<FormatKey, number> = { solo: 299, duo: 398 };

// Nombre d'enfants par formule
const NB_ENFANTS: Record<FormatKey, number> = { solo: 1, duo: 2 };

export default function Tarifs() {
  const [currentLang, setCurrentLang] = useState<Lang>(() => parseLocaleFromPath(window.location.pathname).locale);
  const navigate = useNavigate();
  const lp = (path: string) => localizedPath(path, currentLang);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try { return localStorage.getItem('sks_theme') === 'dark'; } catch { return false; }
  });
  const [selectedFormat, setSelectedFormat] = useState<FormatKey>('solo');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // ── Modal d'inscription (avec support multi-enfants pour Duo/Trio) ──
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'monthly' | 'once'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<{
    key: string;
    title: string;
    price: number;          // prix mensuel (CHF/mois)
    sub: string;
    format: FormatKey;
    engagement: EngagementKey;
  }>({ key: '', title: '', price: 0, sub: '', format: 'solo', engagement: 'm3' });

  const [planFormData, setPlanFormData] = useState({
    parentName: '',
    email: '',
    phone: '',
    children: [{ name: '', age: '' }, { name: '', age: '' }, { name: '', age: '' }],
    message: '',
  });
  const [planSubmitMessage, setPlanSubmitMessage] = useState('');
  const [planSubmitting, setPlanSubmitting] = useState(false);

  // Nombre de mois par formule d'engagement
  const MONTHS: Record<EngagementKey, number> = { m3: 3, m6: 6, m12: 12 };

  // ── Intégration Stripe ──
  // Le paiement passe par la Netlify Function `/.netlify/functions/create-checkout-session`,
  // qui reçoit un `productKey` et crée la session Stripe Checkout correspondante.
  //
  // ⚠️ La Netlify Function doit mapper CHAQUE productKey vers un Stripe Price ID (CHF) :
  //   PAIEMENT MENSUEL (prix récurrent) :
  //     solo-m3   → 299 CHF/mois     duo-m3   → 398 CHF/mois
  //     solo-m6   → 269 CHF/mois     duo-m6   → 358 CHF/mois
  //     solo-m12  → 249 CHF/mois     duo-m12  → 338 CHF/mois
  //   PAIEMENT EN UNE FOIS (prix unique = mensuel × nb de mois) :
  //     solo-m3-once   → 897 CHF      duo-m3-once   → 1194 CHF
  //     solo-m6-once   → 1614 CHF     duo-m6-once   → 2148 CHF
  //     solo-m12-once  → 2988 CHF     duo-m12-once  → 4056 CHF
  //   → 12 Stripe Prices à créer (adaptive_pricing: false), 12 mappings dans la fonction.

  const openPlanModal = (
    format: FormatKey,
    engagement: EngagementKey,
    title: string,
    price: number,
    sub: string,
  ) => {
    const key = `${format}_${engagement}`;
    setSelectedPlan({ key, title, price, sub, format, engagement });
    setPaymentMode('monthly');
    setPlanSubmitMessage('');
    setShowPlanModal(true);
    // Nettoie l'URL (efface tout #ancre résiduel) et pointe vers le lien
    // partageable du formulaire, pour que copier la barre d'adresse à ce
    // moment-là redonne toujours un lien direct et propre.
    navigate(localizedPath('/tarifs/inscription', currentLang), { replace: true });
    try { (window as any).gtag?.('event', 'plan_modal_open', { plan: key }); } catch {}
    try { (window as any).fbq?.('track', 'InitiateCheckout', { content_name: title, value: price, currency: 'CHF', content_category: format }); } catch {}
  };

  const closePlanModal = () => {
    setShowPlanModal(false);
    setPlanSubmitMessage('');
    const { basePath } = parseLocaleFromPath(window.location.pathname);
    if (basePath === '/tarifs/inscription') {
      navigate(localizedPath('/tarifs', currentLang), { replace: true });
    }
  };

  const handlePlanSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPlanSubmitting(true);
    setPlanSubmitMessage('');

    const numChildren = selectedPlan.format === 'solo' ? 1 : selectedPlan.format === 'duo' ? 2 : 3;
    const validChildren = planFormData.children.slice(0, numChildren);

    // Validation côté client : tous les enfants doivent être remplis
    for (let i = 0; i < numChildren; i++) {
      if (!validChildren[i].name.trim() || !validChildren[i].age.trim()) {
        setPlanSubmitMessage('error_missing_child');
        setPlanSubmitting(false);
        return;
      }
    }

    try {
      // ─── Calcul du productKey et du montant selon le mode de paiement ───
      const productKey = paymentMode === 'once'
        ? `${selectedPlan.format}-${selectedPlan.engagement}-once`
        : `${selectedPlan.format}-${selectedPlan.engagement}`;
      const totalAmount = paymentMode === 'once'
        ? PRICES_ONCE[selectedPlan.format][selectedPlan.engagement]
        : selectedPlan.price;
      const priceLabel = paymentMode === 'once'
        ? `${totalAmount} CHF (paiement unique)`
        : `${selectedPlan.price} CHF/mois`;

      // ─── 1. Soumettre le formulaire à Netlify (pour le tracking et notifications) ───
      const formData = new FormData();
      formData.append('form-name', 'plan-enrollment');
      formData.append('plan', selectedPlan.title + ', ' + selectedPlan.sub);
      formData.append('planKey', selectedPlan.key);
      formData.append('planPrice', priceLabel);
      formData.append('paymentMode', paymentMode === 'once' ? 'Paiement en une fois' : 'Paiement mensuel');
      formData.append('parentName', planFormData.parentName);
      formData.append('email', planFormData.email);
      formData.append('phone', planFormData.phone);
      validChildren.forEach((child, i) => {
        formData.append(`child${i + 1}Name`, child.name);
        formData.append(`child${i + 1}Age`, child.age);
      });
      formData.append('numChildren', String(numChildren));
      formData.append('message', planFormData.message);

      const netlifyRes = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as any).toString(),
      });

      if (!netlifyRes.ok) {
        setPlanSubmitMessage('error');
        return;
      }

      try { (window as any).gtag?.('event', 'plan_enrollment_submit', { plan: selectedPlan.key, paymentMode }); } catch {}

      // ─── 2. Créer la session Stripe Checkout via Netlify Function ───
      setPlanSubmitMessage('redirecting');

      const checkoutRes = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productKey,
          customerEmail: planFormData.email,
          metadata: {
            parentName: planFormData.parentName,
            phone: planFormData.phone,
            numChildren: String(numChildren),
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
        setPlanSubmitMessage('error');
        return;
      }

      const { url } = await checkoutRes.json();
      if (!url) {
        setPlanSubmitMessage('error');
        return;
      }

      // ─── 3. Redirection vers Stripe Checkout (CHF strict, no GBP) ───
      window.location.href = url;
    } catch (err) {
      console.error('Submit error:', err);
      setPlanSubmitMessage('error');
    } finally {
      setPlanSubmitting(false);
    }
  };

  // ESC pour fermer la modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPlanModal) closePlanModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showPlanModal]);

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

  // SEO
  useEffect(() => {
    const titles: Record<Lang, string> = {
      FR: 'Tarifs cours programmation enfants, Solo, Duo | Smart Kids School',
      EN: 'Pricing for kids coding classes, Solo, Duo | Smart Kids School',
      DE: 'Preise Programmierkurse Kinder, Solo, Duo | Smart Kids School',
    };
    const descs: Record<Lang, string> = {
      FR: 'Cours de programmation pour enfants en Suisse romande. Tarifs Solo, Duo. Engagement 3, 6 ou 12 mois. Dès 169 CHF/mois par enfant.',
      EN: 'Kids coding classes in Switzerland. Solo, Duo pricing. 3, 6 or 12-month commitment. From CHF 169/month per child.',
      DE: 'Programmierkurse für Kinder in der Schweiz. Solo, Duo Preise. 3, 6 oder 12 Monate Bindung. Ab 169 CHF/Monat pro Kind.',
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
      setHreflangTags('/tarifs', currentLang);
    }

    // Données structurées (Course + offres) : permet à Google d'afficher les
    // prix directement dans les résultats de recherche pour cette page.
    let ldEl = document.querySelector('script[type="application/ld+json"][data-sks="tarifs"]') as HTMLScriptElement;
    if (!ldEl) {
      ldEl = document.createElement('script');
      ldEl.type = 'application/ld+json';
      ldEl.setAttribute('data-sks', 'tarifs');
      document.head.appendChild(ldEl);
    }
    const durationLabel = (m: number) => currentLang === 'FR' ? `${m} mois` : currentLang === 'EN' ? `${m} months` : `${m} Monate`;
    const offerFor = (format: FormatKey, engagement: EngagementKey, months: number) => ({
      '@type': 'Offer',
      name: `${format === 'solo' ? 'Solo' : 'Duo'} — ${durationLabel(months)}`,
      price: String(PRICES_PAR_ENFANT[format][engagement]),
      priceCurrency: 'CHF',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: String(PRICES_PAR_ENFANT[format][engagement]),
        priceCurrency: 'CHF',
        unitCode: 'MON',
        unitText: currentLang === 'FR' ? 'par mois, par enfant' : currentLang === 'EN' ? 'per month, per child' : 'pro Monat, pro Kind',
      },
      url: 'https://smartkids-school.ch' + localizedPath('/tarifs', currentLang),
    });
    ldEl.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: currentLang === 'FR' ? 'Cours de programmation pour enfants — Solo & Duo' : currentLang === 'EN' ? 'Coding classes for kids — Solo & Duo' : 'Programmierkurse für Kinder — Solo & Duo',
      description: descs[currentLang],
      provider: { '@type': 'EducationalOrganization', name: 'Smart Kids School', sameAs: 'https://smartkids-school.ch' },
      offers: [
        offerFor('solo', 'm3', 3), offerFor('solo', 'm6', 6), offerFor('solo', 'm12', 12),
        offerFor('duo', 'm3', 3), offerFor('duo', 'm6', 6), offerFor('duo', 'm12', 12),
      ],
    });
  }, [currentLang]);

  const t = T[currentLang];
  const prices = PRICES[selectedFormat];
  const ref = REFERENCE[selectedFormat];

  // Phrases claires pour les sessions selon la langue
  const sessionsMonthly = currentLang === 'FR' ? '4 séances de 1h par mois' : currentLang === 'EN' ? '4 sessions of 1h per month' : '4 Sitzungen à 1h pro Monat';
  const sessions12 = currentLang === 'FR' ? '12 séances de 1h au total' : currentLang === 'EN' ? '12 sessions of 1h total' : '12 Sitzungen à 1h gesamt';
  const sessions24 = currentLang === 'FR' ? '24 séances de 1h au total' : currentLang === 'EN' ? '24 sessions of 1h total' : '24 Sitzungen à 1h gesamt';
  const sessions48 = currentLang === 'FR' ? '48 séances de 1h au total' : currentLang === 'EN' ? '48 sessions of 1h total' : '48 Sitzungen à 1h gesamt';

  const engagementCards: { key: EngagementKey; title: string; sub: string; sessions: string; access: string; badge?: string; savings: number; popular?: boolean; best?: boolean }[] = [
    { key: 'm3', title: t.eng3, sub: t.eng3Sub, sessions: sessions12, access: `${t.accessFor} ${t.threeMonths}`, savings: 0 },
    { key: 'm6', title: t.eng6, sub: t.eng6Sub, sessions: sessions24, access: `${t.accessFor} ${t.sixMonths}`, badge: t.mostPopular, popular: true, savings: Math.round((1 - prices.m6 / ref) * 100) },
    { key: 'm12', title: t.eng12, sub: t.eng12Sub, sessions: sessions48, access: `${t.accessFor} ${t.twelveMonths}`, badge: t.bestValue, best: true, savings: Math.round((1 - prices.m12 / ref) * 100) },
  ];

  // Lien direct vers le formulaire (ex: /tarifs/inscription) : ouvre la modal
  // automatiquement avec la formule "6 mois" (la plus populaire) présélectionnée.
  useEffect(() => {
    const { basePath } = parseLocaleFromPath(window.location.pathname);
    if (basePath === '/tarifs/inscription') {
      const card = engagementCards.find(c => c.key === 'm6');
      if (card) openPlanModal(selectedFormat, 'm6', card.title, prices.m6, card.sub);
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
              <a href={lp('/tarifs')} className="text-sm font-semibold text-[#232999]">{t.nav.tarifs}</a>
              <a href={lp('/stages')} className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.nav.stages}</a>
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
                      <button key={lang} onClick={() => { setCurrentLang(lang); setShowLangDropdown(false); navigate(localizedPath('/tarifs', lang)); }}
                        className={`w-full px-4 py-2.5 text-sm text-left transition-colors cursor-pointer ${currentLang === lang ? 'bg-[#232999] text-white font-semibold' : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-indigo-50'}`}>
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => document.getElementById('tarifs-detailles')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="bg-[#232999] hover:bg-[#1a1f7a] text-white px-6 py-3 rounded-full text-sm font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer">{t.nav.enroll}</button>
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
              <a href={lp('/tarifs')} onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold py-2 text-[#232999]">{t.nav.tarifs}</a>
              <a href={lp('/stages')} onClick={() => setMobileMenuOpen(false)} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.nav.stages}</a>
              <a href={lp('/faq')} onClick={() => setMobileMenuOpen(false)} className={`block text-sm font-medium py-2 ${darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-700'}`}>{t.nav.faq}</a>
              <div className="flex gap-2 py-2">
                {(['FR', 'EN', 'DE'] as Lang[]).map(lang => (
                  <button key={lang} onClick={() => { setCurrentLang(lang); setMobileMenuOpen(false); navigate(localizedPath('/tarifs', lang)); }} className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${currentLang === lang ? 'bg-[#232999] text-white' : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{lang}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero + How it works (fusionné, condensé) ── */}
      <section className={`relative pt-32 pb-12 px-4 overflow-hidden ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800' : 'bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-50'}`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#232999] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <span className="text-[#232999] font-semibold text-sm uppercase tracking-wider">
              {currentLang === 'FR' ? 'Nos formules' : currentLang === 'EN' ? 'Our plans' : 'Unsere Formeln'}
            </span>
            <h1 className={`text-4xl lg:text-5xl font-bold mt-3 mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.heroTitle}</h1>
            <p className={`text-base max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.howDesc}</p>
            <div className={`mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${darkMode ? 'bg-gray-800 text-gray-300 border border-gray-700' : 'bg-white text-gray-700 border border-indigo-100 shadow-sm'}`}>
              <span>🎖️</span>
              <span>{currentLang === 'FR' ? 'Programme conçu par des ingénieurs diplômés' : currentLang === 'EN' ? 'Curriculum designed by engineers from' : 'Lehrplan entwickelt von Ingenieuren der'}</span>
              <img src="/epfl.png" alt="EPFL" className={`h-8 w-auto inline-block ${darkMode ? 'invert' : ''}`} />
              <img src="/ethz.png" alt="ETH Zürich" className={`h-8 w-auto inline-block ${darkMode ? 'invert' : ''}`} />
            </div>

            {/* Bande "sur-mesure" : les 3 questions que les parents posent vraiment au téléphone.
                Placée haut et visible (avant, l'info était noyée dans la FAQ). */}
            <div className="grid sm:grid-cols-3 gap-3 max-w-3xl mx-auto mt-8">
              {[
                { icon: 'ri-time-line', t: { FR: 'Horaires à la carte', EN: 'Hours to suit you', DE: 'Zeiten nach Wahl' }, d: { FR: 'De 9h à 19h · vous choisissez vos créneaux', EN: '9am to 7pm · you pick your slots', DE: '9 bis 19 Uhr · Sie wählen' } },
                { icon: 'ri-speed-up-line', t: { FR: 'Rythme adapté', EN: 'Pace that adapts', DE: 'Angepasstes Tempo' }, d: { FR: "Le programme suit votre enfant, pas l'inverse", EN: 'The programme follows your child, not the reverse', DE: 'Das Programm folgt Ihrem Kind' } },
                { icon: 'ri-user-heart-line', t: { FR: 'Vraiment personnalisé', EN: 'Truly personalised', DE: 'Wirklich persönlich' }, d: { FR: 'Cours individuel ou en duo, jamais en masse', EN: 'One-to-one or duo, never a crowd', DE: 'Einzeln oder zu zweit, nie in Masse' } },
              ].map((item, i) => (
                <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl border text-left ${darkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white border-indigo-100 shadow-sm'}`}>
                  <i className={`${item.icon} text-xl text-[#232999] mt-0.5`}></i>
                  <div>
                    <p className={`text-sm font-bold leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.t[currentLang]}</p>
                    <p className={`text-xs mt-1 leading-snug ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.d[currentLang]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2 cards Solo/Duo plus compactes */}
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className={`flex gap-4 p-5 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} transition-all hover:shadow-md`}>
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#232999] to-indigo-500 rounded-xl flex items-center justify-center text-2xl">👤</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.how1T}</h3>
                  <span className={`text-xs font-semibold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>{t.how1Sub}</span>
                </div>
                <p className={`text-sm leading-snug ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.how1Desc}</p>
              </div>
            </div>

            <div className={`flex gap-4 p-5 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} transition-all hover:shadow-md`}>
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-2xl">👨‍👩‍👧</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.how2T}</h3>
                  <span className={`text-xs font-semibold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>{t.how2Sub}</span>
                </div>
                <p className={`text-sm leading-snug ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.how2Desc}</p>
              </div>
            </div>
          </div>

          {/* Note discrète sur fond gris */}
          <p className={`text-center text-xs mt-6 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            <i className="ri-information-line mr-1"></i>{t.howNote}
          </p>
        </div>
      </section>

      {/* ── Format selector + engagement cards (fusionné : plus de titre redondant, on enchaîne sur le choix) ── */}
      <section id="tarifs-detailles" className={`py-16 px-4 ${darkMode ? 'bg-gray-950' : 'bg-gradient-to-br from-indigo-50/60 via-slate-50 to-indigo-50/40'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className={`text-sm max-w-2xl mx-auto italic ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
              <i className="ri-graduation-cap-line mr-1"></i>
              {currentLang === 'FR'
                ? "Chaque formule couvre au minimum un module complet (environ 3 mois) pour que votre enfant aille au bout de son apprentissage et en ressorte avec de vraies bases."
                : currentLang === 'EN'
                ? "Each plan covers at least one full module (around 3 months) so your child completes their learning journey and comes away with solid foundations."
                : "Jede Formel umfasst mindestens ein vollständiges Modul (etwa 3 Monate), damit Ihr Kind seinen Lernweg abschliesst und mit soliden Grundlagen herausgeht."}
            </p>
          </div>

          {/* Format toggle */}
          <div className="flex justify-center mb-12">
            <div className={`inline-flex rounded-full p-1.5 ${darkMode ? 'bg-gray-800' : 'bg-white shadow-md border border-gray-200'}`}>
              {(['solo', 'duo'] as FormatKey[]).map(f => (
                <button key={f} onClick={() => setSelectedFormat(f)}
                  className={`px-8 py-3 rounded-full text-sm font-semibold transition-all ${selectedFormat === f ? 'bg-[#232999] text-white shadow-md' : darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-[#232999]'}`}>
                  {f === 'solo' ? t.formatSolo : t.formatDuo}
                </button>
              ))}
            </div>
          </div>

          {/* Engagement cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto items-stretch">
            {engagementCards.map(card => {
              const price = prices[card.key];
              return (
                <div key={card.key}
                  className={`relative rounded-3xl border-2 p-6 transition-all hover:shadow-2xl hover:-translate-y-2 flex flex-col ${
                    card.popular ? (darkMode ? 'bg-gray-800 border-[#232999]' : 'bg-white border-[#232999]') :
                    card.best ? (darkMode ? 'bg-gradient-to-br from-indigo-900/30 to-gray-800 border-indigo-500' : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-400') :
                    (darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')
                  }`}>
                  {card.badge && (
                    <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap ${card.popular ? 'bg-[#232999] text-white' : 'bg-indigo-500 text-white'}`}>{card.badge}</span>
                  )}
                  <div className="text-center mb-5">
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{card.title}</h3>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{card.sub}</p>
                  </div>
                  <div className="text-center mb-6">
                    {NB_ENFANTS[selectedFormat] > 1 ? (
                      // ── DUO : prix par enfant en gros, total famille en dessous ──
                      <>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className={`text-5xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{PRICES_PAR_ENFANT[selectedFormat][card.key]}</span>
                          <span className={`text-lg font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.chf}</span>
                        </div>
                        <p className={`text-xs mt-1 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {currentLang === 'FR' ? '/ mois · par enfant' : currentLang === 'EN' ? '/ month · per child' : '/ Monat · pro Kind'}
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {currentLang === 'FR' ? `soit ${price} CHF/mois pour les 2 enfants` : currentLang === 'EN' ? `that's ${price} CHF/month for both children` : `d.h. ${price} CHF/Monat für beide Kinder`}
                        </p>
                      </>
                    ) : (
                      // ── SOLO : prix total en gros ──
                      <>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className={`text-5xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{price}</span>
                          <span className={`text-lg font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.chf}</span>
                        </div>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{t.perMonth}</p>
                      </>
                    )}
                    <div className="mt-3 min-h-[28px] flex items-center justify-center">
                      {card.savings > 0 ? (
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                          −{card.savings}% · {t.save} {(ref - price) * (card.key === 'm6' ? 6 : 12)} CHF
                        </span>
                      ) : (
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {currentLang === 'FR' ? 'Idéal pour démarrer' : currentLang === 'EN' ? 'Perfect to get started' : 'Ideal für den Start'}
                        </span>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-2.5 mb-6 text-sm flex-grow">
                    <li className="flex items-start gap-2">
                      <i className="ri-check-line text-emerald-500 text-lg flex-shrink-0"></i>
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{card.sessions}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="ri-check-line text-emerald-500 text-lg flex-shrink-0"></i>
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{card.access}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="ri-check-line text-emerald-500 text-lg flex-shrink-0"></i>
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{currentLang === 'FR' ? 'Tous les niveaux inclus' : currentLang === 'EN' ? 'All levels included' : 'Alle Niveaus inkl.'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="ri-check-line text-emerald-500 text-lg flex-shrink-0"></i>
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{currentLang === 'FR' ? 'Garantie 1ère séance' : currentLang === 'EN' ? '1st session guarantee' : 'Garantie 1. Sitzung'}</span>
                    </li>
                  </ul>
                  <button onClick={() => openPlanModal(selectedFormat, card.key as EngagementKey, card.title, price, card.sub)} className={`block w-full text-center py-3 rounded-full font-bold transition-all mt-auto cursor-pointer ${
                    card.popular || card.best ? 'bg-gradient-to-r from-[#232999] to-indigo-600 text-white hover:shadow-lg' :
                    'bg-[#232999] text-white hover:bg-[#1a1f7a]'
                  }`}>{t.chooseThis}</button>
                </div>
              );
            })}
          </div>

          <p className={`text-center text-sm mt-10 max-w-2xl mx-auto ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            <i className="ri-information-line mr-2"></i>
            {currentLang === 'FR' ? 'Tous les prix s\'entendent par enfant et par mois. 4 séances de 1h par mois (1 par semaine). Le tarif baisse automatiquement quand un 2e ou 3e enfant rejoint le cours.' : currentLang === 'EN' ? 'All prices per child per month. 4 sessions of 1h per month (1 per week). Price drops automatically when a 2nd or 3rd child joins.' : 'Alle Preise pro Kind und Monat. 4 Sitzungen à 1h pro Monat. Preis sinkt automatisch bei 2. oder 3. Kind.'}
          </p>
        </div>
      </section>

      {/* ── Inclus + Garantie + Paiement (fusionné) ── */}
      {/* ── Programme inclus : le parcours de votre enfant ── */}
      <section className={`py-20 px-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#232999] font-semibold text-sm uppercase tracking-wider">
              {currentLang === 'FR' ? 'Programme inclus' : currentLang === 'EN' ? 'Program included' : 'Programm inklusive'}
            </span>
            <h2 className={`text-3xl lg:text-4xl font-bold mt-3 mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {currentLang === 'FR' ? 'Le parcours de votre enfant' : currentLang === 'EN' ? "Your child's learning path" : 'Der Lernweg Ihres Kindes'}
            </h2>
            <p className={`text-base max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentLang === 'FR' ? "4 étapes progressives, du premier jeu à la spécialisation." : currentLang === 'EN' ? '4 progressive steps, from first game to specialization.' : '4 progressive Stufen, vom ersten Spiel zur Spezialisierung.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: 1,
                duration: { FR: '~3 mois', EN: '~3 months', DE: '~3 Monate' },
                emoji: '🐱',
                iconBg: darkMode ? 'bg-orange-900/30' : 'bg-orange-100',
                title: { FR: 'Scratch', EN: 'Scratch', DE: 'Scratch' },
                desc: {
                  FR: 'Premier contact avec la logique de programmation, par blocs visuels colorés.',
                  EN: 'First contact with programming logic, through colorful visual blocks.',
                  DE: 'Erster Kontakt mit Programmierlogik, mit farbigen visuellen Blöcken.',
                },
                chips: { FR: ['Logique', 'Animation', 'Boucles'], EN: ['Logic', 'Animation', 'Loops'], DE: ['Logik', 'Animation', 'Schleifen'] },
                accent: false,
              },
              {
                step: 2,
                duration: { FR: '~3 mois', EN: '~3 months', DE: '~3 Monate' },
                emoji: '🐢',
                iconBg: darkMode ? 'bg-emerald-900/30' : 'bg-emerald-100',
                title: { FR: 'Python Turtle', EN: 'Python Turtle', DE: 'Python Turtle' },
                desc: {
                  FR: "Premier vrai code. On programme une tortue qui dessine : ludique, mais c'est du Python.",
                  EN: "First real code. We program a turtle that draws: playful, but it's Python.",
                  DE: 'Erster echter Code. Eine Schildkröte programmieren, die zeichnet: spielerisch, aber Python.',
                },
                chips: { FR: ['Variables', 'Fonctions', 'Dessin'], EN: ['Variables', 'Functions', 'Drawing'], DE: ['Variablen', 'Funktionen', 'Zeichnen'] },
                accent: false,
              },
              {
                step: 3,
                duration: { FR: '~6 mois', EN: '~6 months', DE: '~6 Monate' },
                emoji: '🐍',
                iconBg: darkMode ? 'bg-blue-900/30' : 'bg-blue-100',
                title: { FR: 'Python', EN: 'Python', DE: 'Python' },
                desc: {
                  FR: "Apprenti développeur. L'enfant construit ses premiers vrais projets en autonomie.",
                  EN: 'Apprentice developer. The child builds their first real projects independently.',
                  DE: 'Junior-Entwickler. Das Kind baut seine ersten echten Projekte selbständig.',
                },
                chips: { FR: ['Algorithmes', 'Structures', 'Projets'], EN: ['Algorithms', 'Structures', 'Projects'], DE: ['Algorithmen', 'Strukturen', 'Projekte'] },
                accent: false,
              },
              {
                step: 4,
                duration: { FR: 'Au choix', EN: 'Their choice', DE: 'Nach Wahl' },
                emoji: '🚀',
                iconBg: darkMode ? 'bg-amber-900/30' : 'bg-amber-100',
                title: { FR: 'Spécialisation', EN: 'Specialization', DE: 'Spezialisierung' },
                desc: {
                  FR: 'Votre enfant choisit son terrain de jeu favori et y développe une vraie expertise.',
                  EN: 'Your child chooses their favorite playground and develops real expertise.',
                  DE: 'Ihr Kind wählt sein Lieblingsfeld und entwickelt echte Expertise.',
                },
                chips: { FR: ['Web', 'IA', 'Jeux', 'Automatisation'], EN: ['Web', 'AI', 'Games', 'Automation'], DE: ['Web', 'KI', 'Spiele', 'Automation'] },
                accent: true,
              },
            ].map((s, i) => (
              <div key={i} className={`rounded-3xl p-6 border-2 hover:shadow-lg transition-all ${s.accent ? (darkMode ? 'border-amber-700/50 bg-amber-900/10' : 'border-amber-200 bg-gradient-to-br from-amber-50/40 to-white') : (darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white')}`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.accent ? (darkMode ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-900') : (darkMode ? 'bg-indigo-900/40 text-indigo-300' : 'bg-indigo-100 text-indigo-900')}`}>
                    {currentLang === 'FR' ? `Étape ${s.step}` : currentLang === 'EN' ? `Step ${s.step}` : `Stufe ${s.step}`}
                  </span>
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{s.duration[currentLang]}</span>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${s.iconBg}`}>
                  <span className="text-2xl">{s.emoji}</span>
                </div>
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{s.title[currentLang]}</h3>
                <p className={`text-sm mb-4 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{s.desc[currentLang]}</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.chips[currentLang].map((chip, j) => (
                    <span key={j} className={`text-xs px-2 py-0.5 rounded-full ${s.accent ? (darkMode ? 'bg-amber-900/30 text-amber-200' : 'bg-amber-50 text-amber-800') : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700')}`}>{chip}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── Aperçu du certificat de fin de parcours ── */}
          <div className="mt-14 max-w-xl mx-auto">
            <div className="text-center mb-6">
              <h3 className={`text-2xl lg:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentLang === 'FR' ? 'Un certificat à chaque étape franchie' : currentLang === 'EN' ? 'A certificate at every milestone' : 'Ein Zertifikat für jeden Meilenstein'}
              </h3>
              <p className={`mt-3 max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentLang === 'FR' ? "À la fin de chaque module, votre enfant reçoit un certificat officiel signé, à afficher fièrement." : currentLang === 'EN' ? 'At the end of each module, your child receives an official signed certificate to display proudly.' : 'Am Ende jedes Moduls erhält Ihr Kind ein offizielles, signiertes Zertifikat.'}
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              <img src="/certificat-exemple-python.png" alt="Exemple de certificat Smart Kids School" loading="lazy" className="w-full h-auto block" />
            </div>
          </div>
        </div>
      </section>
      <section className={`py-20 px-4 ${darkMode ? 'bg-gray-950' : 'bg-gradient-to-br from-slate-50 to-white'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#232999] font-semibold text-sm uppercase tracking-wider">{t.incLabel}</span>
            <h2 className={`text-3xl lg:text-4xl font-bold mt-3 mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {currentLang === 'FR' ? 'Tout est dans le prix affiché' : currentLang === 'EN' ? "It's all in the displayed price" : 'Alles ist im angezeigten Preis enthalten'}
            </h2>
            <p className={`text-base max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentLang === 'FR' ? "Une seule mensualité couvre l'intégralité de l'expérience SKS." : currentLang === 'EN' ? 'A single monthly fee covers the entire SKS experience.' : 'Eine monatliche Zahlung deckt das gesamte SKS-Erlebnis ab.'}
            </p>
          </div>

          {/* Grille 3×2 des inclusions (chaque carte a sa couleur pour le rythme visuel) */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            {[
              { icon: 'ri-focus-3-line', color: 'indigo', t: { FR: 'Cours hebdo', EN: 'Weekly classes', DE: 'Wöchentlicher Unterricht' }, d: { FR: '4 séances/mois · accélérable', EN: '4 sessions/month · can be accelerated', DE: '4 Sitzungen/Monat · beschleunigbar' } },
              { icon: 'ri-book-open-line', color: 'sky', t: { FR: 'Matériel pédago', EN: 'Learning materials', DE: 'Lernmaterial' }, d: { FR: 'Exercices et projets fournis', EN: 'Exercises and projects provided', DE: 'Übungen und Projekte inklusive' } },
              { icon: 'ri-line-chart-line', color: 'violet', t: { FR: 'Suivi parents', EN: 'Parent updates', DE: 'Eltern-Austausch' }, d: { FR: 'Point régulier avec vous', EN: 'Regular check-in with you', DE: 'Regelmässiger Austausch' } },
              { icon: 'ri-medal-line', color: 'amber', t: { FR: 'Certificat', EN: 'Certificate', DE: 'Zertifikat' }, d: { FR: 'À chaque module terminé', EN: 'For every completed module', DE: 'Für jedes abgeschlossene Modul' } },
              { icon: 'ri-shield-check-line', color: 'emerald', t: { FR: 'Garantie', EN: 'Guarantee', DE: 'Garantie' }, d: { FR: 'Remboursé après 1ère séance', EN: 'Refunded after 1st session', DE: 'Erstattung nach 1. Sitzung' } },
              { icon: 'ri-whatsapp-line', color: 'green', t: { FR: 'Support WhatsApp', EN: 'WhatsApp support', DE: 'WhatsApp-Support' }, d: { FR: 'Réponse rapide', EN: 'Quick reply', DE: 'Schnelle Antwort' } },
            ].map((item, i) => {
              const palette = {
                indigo: { bg: darkMode ? 'bg-indigo-900/40' : 'bg-indigo-100', ic: darkMode ? 'text-indigo-300' : 'text-indigo-600', hov: darkMode ? 'hover:border-indigo-500/50' : 'hover:border-indigo-300' },
                sky: { bg: darkMode ? 'bg-sky-900/40' : 'bg-sky-100', ic: darkMode ? 'text-sky-300' : 'text-sky-600', hov: darkMode ? 'hover:border-sky-500/50' : 'hover:border-sky-300' },
                violet: { bg: darkMode ? 'bg-violet-900/40' : 'bg-violet-100', ic: darkMode ? 'text-violet-300' : 'text-violet-600', hov: darkMode ? 'hover:border-violet-500/50' : 'hover:border-violet-300' },
                amber: { bg: darkMode ? 'bg-amber-900/40' : 'bg-amber-100', ic: darkMode ? 'text-amber-300' : 'text-amber-600', hov: darkMode ? 'hover:border-amber-500/50' : 'hover:border-amber-300' },
                emerald: { bg: darkMode ? 'bg-emerald-900/40' : 'bg-emerald-100', ic: darkMode ? 'text-emerald-300' : 'text-emerald-600', hov: darkMode ? 'hover:border-emerald-500/50' : 'hover:border-emerald-300' },
                green: { bg: darkMode ? 'bg-green-900/40' : 'bg-green-100', ic: darkMode ? 'text-green-300' : 'text-green-600', hov: darkMode ? 'hover:border-green-500/50' : 'hover:border-green-300' },
              }[item.color];
              return (
                <div key={i} className={`text-center p-6 rounded-2xl border-2 transition-all hover:shadow-md hover:-translate-y-0.5 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${palette.hov}`}>
                  <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center ${palette.bg}`}>
                    <i className={`${item.icon} text-2xl ${palette.ic}`}></i>
                  </div>
                  <h4 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.t[currentLang]}</h4>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.d[currentLang]}</p>
                </div>
              );
            })}
          </div>

          {/* Garantie agrandie (remplace la version compacte) */}
          <div className={`rounded-3xl p-6 mb-6 flex items-center gap-5 ${darkMode ? 'bg-emerald-900/20 border-2 border-emerald-500/30' : 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-300'}`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-emerald-600' : 'bg-emerald-500'}`}>
              <i className="ri-shield-check-line text-4xl text-white"></i>
            </div>
            <div className="flex-1">
              <h3 className={`text-xl font-bold mb-1 ${darkMode ? 'text-emerald-200' : 'text-emerald-900'}`}>{t.guaranteeTitle}</h3>
              <p className={`text-sm ${darkMode ? 'text-emerald-300/80' : 'text-emerald-800'}`}>
                {currentLang === 'FR' ? "Sans question, sans paperasse. Si votre enfant n'accroche pas dès la première séance, on vous rembourse intégralement." : currentLang === 'EN' ? "No questions, no paperwork. If your child doesn't connect from the first session, we refund you in full." : 'Keine Fragen, kein Papierkram. Wenn Ihr Kind nicht ab der ersten Sitzung Anschluss findet, erstatten wir Ihnen vollständig.'}
              </p>
            </div>
          </div>

          {/* Paiement (ligne unique discrète) */}
          <div className={`rounded-2xl p-5 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
              <span className="flex items-center gap-2"><i className="ri-bank-card-line text-[#232999] text-lg"></i><span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{currentLang === 'FR' ? 'Carte bancaire' : currentLang === 'EN' ? 'Credit card' : 'Kreditkarte'}</span></span>
              <span className={darkMode ? 'text-gray-700' : 'text-gray-300'}>·</span>
              <span className="flex items-center gap-2"><i className="ri-bank-line text-emerald-500 text-lg"></i><span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{currentLang === 'FR' ? 'Virement' : currentLang === 'EN' ? 'Bank transfer' : 'Banküberweisung'}</span></span>
              <span className={darkMode ? 'text-gray-700' : 'text-gray-300'}>·</span>
              <span className="flex items-center gap-2"><i className="ri-calendar-2-line text-indigo-500 text-lg"></i><span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{currentLang === 'FR' ? 'Paiement en plusieurs fois' : currentLang === 'EN' ? 'Instalments' : 'Ratenzahlung'}</span></span>
              <span className={darkMode ? 'text-gray-700' : 'text-gray-300'}>·</span>
              <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}><i className="ri-shield-check-line mr-1 text-emerald-500"></i>{currentLang === 'FR' ? '100% sécurisé via Stripe' : currentLang === 'EN' ? '100% secure via Stripe' : '100% sicher über Stripe'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Premium teaser : MASQUÉ tant que l'offre Premium n'est pas finalisée.
          Pour le réafficher : changer `{false &&` en `{true &&` (ou retirer le wrapper). ── */}
      {false && (
      <section className={`py-12 px-4 ${darkMode ? 'bg-gray-900 border-t border-gray-800' : 'bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 border-t border-amber-100'}`}>
        <div className="max-w-4xl mx-auto">
          <a href={lp('/premium')} className={`flex items-center justify-between gap-4 p-6 rounded-3xl border-2 transition-all hover:shadow-xl group ${darkMode ? 'bg-gray-800 border-amber-700/50 hover:border-amber-500' : 'bg-white border-amber-200 hover:border-amber-400'}`}>
            <div className="flex items-center gap-4 flex-1">
              <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${darkMode ? 'bg-amber-900/40' : 'bg-amber-100'}`}>
                ✨
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                  {currentLang === 'FR' ? 'Offre exclusive' : currentLang === 'EN' ? 'Exclusive offer' : 'Exklusives Angebot'}
                </p>
                <h3 className={`text-xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentLang === 'FR' ? 'Découvrez Premium' : currentLang === 'EN' ? 'Discover Premium' : 'Premium entdecken'}
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentLang === 'FR'
                    ? "Un mentorat individuel avec le fondateur : 2 séances par semaine, un vrai projet publié en 12 mois."
                    : currentLang === 'EN'
                    ? 'One-to-one mentoring with the founder: 2 sessions a week, a real project published within 12 months.'
                    : 'Einzelmentoring mit dem Gründer: 2 Sitzungen pro Woche, ein echtes Projekt in 12 Monaten veröffentlicht.'}
                </p>
              </div>
            </div>
            <div className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-transform group-hover:translate-x-1 ${darkMode ? 'bg-amber-500/20 text-amber-300 border border-amber-700' : 'bg-amber-500 text-white'}`}>
              {currentLang === 'FR' ? 'En savoir plus' : currentLang === 'EN' ? 'Learn more' : 'Mehr erfahren'} →
            </div>
          </a>
        </div>
      </section>
      )}

      {/* ── CTA ── */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#232999] via-[#1e2470] to-[#171b54] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">{t.ctaTitle}</h2>
          <p className="text-xl text-white/90 mb-10">{t.ctaDesc}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => document.getElementById('tarifs-detailles')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="bg-white text-[#232999] px-8 py-4 rounded-full font-bold hover:shadow-2xl transform hover:scale-105 transition-all cursor-pointer">{t.ctaBtn}</button>
            <a href="https://wa.me/41774768492" target="_blank" rel="noopener noreferrer" className="bg-[#25D366] hover:bg-[#1ebe5d] text-white px-8 py-4 rounded-full font-bold transition-all">{t.ctaBtn2}</a>
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

      {/* ── Modal d'inscription ── */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closePlanModal}>
          <div className={`rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <div className={`sticky top-0 border-b px-8 py-6 flex items-center justify-between rounded-t-3xl ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div>
                <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentLang === 'FR' ? 'Inscription' : currentLang === 'EN' ? 'Enrollment' : 'Anmeldung'}
                </h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedPlan.title} · {selectedPlan.sub}</p>
              </div>
              <button onClick={closePlanModal} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {planSubmitMessage === 'success_no_stripe' ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-mail-line text-4xl text-amber-600"></i>
                </div>
                <h4 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentLang === 'FR' ? 'Demande envoyée !' : currentLang === 'EN' ? 'Request sent!' : 'Anfrage gesendet!'}
                </h4>
                <p className={`leading-relaxed mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentLang === 'FR'
                    ? "Merci ! Nous vous envoyons le lien de paiement par email sous 24h."
                    : currentLang === 'EN'
                    ? "Thanks! We'll send you the payment link by email within 24h."
                    : 'Danke! Wir senden Ihnen den Zahlungslink innerhalb von 24h per E-Mail.'}
                </p>
                <button onClick={closePlanModal} className="bg-[#232999] hover:bg-[#1a1f7a] text-white px-8 py-3 rounded-full font-semibold transition-all cursor-pointer">
                  {currentLang === 'FR' ? 'Fermer' : currentLang === 'EN' ? 'Close' : 'Schliessen'}
                </button>
              </div>
            ) : (
              <form onSubmit={handlePlanSubmit} name="plan-enrollment" data-netlify="true" className="p-8" id="plan-form">
                <input type="hidden" name="form-name" value="plan-enrollment" />
                <input type="hidden" name="plan" value={selectedPlan.title + ', ' + selectedPlan.sub} />
                <input type="hidden" name="planKey" value={selectedPlan.key} />
                <input type="hidden" name="planPrice" value={paymentMode === 'once' ? `${PRICES_ONCE[selectedPlan.format][selectedPlan.engagement]} CHF (paiement unique)` : `${selectedPlan.price} CHF/mois`} />
                <input type="hidden" name="paymentMode" value={paymentMode === 'once' ? 'Paiement en une fois' : 'Paiement mensuel'} />

                <div className={`mb-6 p-4 rounded-2xl border-2 ${darkMode ? 'bg-indigo-900/20 border-indigo-700' : 'bg-indigo-50 border-indigo-200'}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-indigo-300' : 'text-[#232999]'}`}>
                        {currentLang === 'FR' ? 'Formule choisie' : currentLang === 'EN' ? 'Plan selected' : 'Gewähltes Abo'}
                      </p>
                      <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPlan.title} <span className="font-normal text-sm">· {selectedPlan.sub}</span></p>
                    </div>
                    <div className="text-right">
                      {paymentMode === 'once' ? (
                        <>
                          <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-[#232999]'}`}>
                            {PRICES_ONCE[selectedPlan.format][selectedPlan.engagement]} CHF
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <span className="line-through mr-1">{selectedPlan.price * MONTHS[selectedPlan.engagement]} CHF</span>
                            {currentLang === 'FR' ? 'réglé en une fois' : currentLang === 'EN' ? 'paid once' : 'einmalig bezahlt'}
                          </p>
                          <p className={`text-xs font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            {(() => {
                              const full = selectedPlan.price * MONTHS[selectedPlan.engagement];
                              const once = PRICES_ONCE[selectedPlan.format][selectedPlan.engagement];
                              const saved = full - once;
                              return currentLang === 'FR' ? `Économie de ${saved} CHF` : currentLang === 'EN' ? `Save ${saved} CHF` : `${saved} CHF gespart`;
                            })()}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-[#232999]'}`}>{selectedPlan.price} CHF<span className="text-sm font-normal">/{currentLang === 'FR' ? 'mois' : currentLang === 'EN' ? 'mo' : 'Mo'}</span></p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{currentLang === 'FR' ? `sur ${MONTHS[selectedPlan.engagement]} mois` : currentLang === 'EN' ? `over ${MONTHS[selectedPlan.engagement]} months` : `über ${MONTHS[selectedPlan.engagement]} Monate`}</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Toggle mode de paiement */}
                  <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-indigo-700/60' : 'border-indigo-200'}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-indigo-300' : 'text-[#232999]'}`}>
                      {currentLang === 'FR' ? 'Mode de paiement' : currentLang === 'EN' ? 'Payment method' : 'Zahlungsart'}
                    </p>
                    <div className={`inline-flex w-full rounded-xl p-1 ${darkMode ? 'bg-gray-800' : 'bg-white border border-indigo-200'}`}>
                      <button type="button" onClick={() => setPaymentMode('monthly')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${paymentMode === 'monthly' ? 'bg-[#232999] text-white shadow-sm' : darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {currentLang === 'FR' ? 'Mensuel' : currentLang === 'EN' ? 'Monthly' : 'Monatlich'}
                      </button>
                      <button type="button" onClick={() => setPaymentMode('once')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${paymentMode === 'once' ? 'bg-[#232999] text-white shadow-sm' : darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {currentLang === 'FR' ? 'En une fois' : currentLang === 'EN' ? 'One-time' : 'Einmalzahlung'}
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${paymentMode === 'once' ? 'bg-emerald-400 text-emerald-950' : darkMode ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>−10%</span>
                      </button>
                    </div>
                    <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {paymentMode === 'once'
                        ? (currentLang === 'FR'
                            ? `Réglez l'intégralité de la formule en un seul paiement.`
                            : currentLang === 'EN'
                            ? 'Pay the full plan in a single payment.'
                            : 'Zahlen Sie die gesamte Formel in einer einzigen Zahlung.')
                        : (currentLang === 'FR'
                            ? `Un prélèvement chaque mois pendant ${MONTHS[selectedPlan.engagement]} mois.`
                            : currentLang === 'EN'
                            ? `One charge each month for ${MONTHS[selectedPlan.engagement]} months.`
                            : `Eine monatliche Abbuchung über ${MONTHS[selectedPlan.engagement]} Monate.`)}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="plan-parent" className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {currentLang === 'FR' ? 'Nom du parent *' : currentLang === 'EN' ? "Parent's name *" : 'Name des Elternteils *'}
                    </label>
                    <input id="plan-parent" type="text" name="parentName" value={planFormData.parentName} onChange={e => setPlanFormData({ ...planFormData, parentName: e.target.value })} required className={`w-full px-4 py-3 rounded-xl border focus:border-[#232999] focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`} />
                  </div>
                  <div>
                    <label htmlFor="plan-email" className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email *</label>
                    <input id="plan-email" type="email" name="email" value={planFormData.email} onChange={e => setPlanFormData({ ...planFormData, email: e.target.value })} required className={`w-full px-4 py-3 rounded-xl border focus:border-[#232999] focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`} placeholder="votre@email.com" />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="plan-phone" className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {currentLang === 'FR' ? 'Téléphone *' : currentLang === 'EN' ? 'Phone *' : 'Telefon *'}
                  </label>
                  <input id="plan-phone" type="tel" name="phone" value={planFormData.phone} onChange={e => setPlanFormData({ ...planFormData, phone: e.target.value })} required className={`w-full px-4 py-3 rounded-xl border focus:border-[#232999] focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`} placeholder="+41 XX XXX XX XX" />
                </div>

                {/* ── Section enfants (1, 2 ou 3 selon formule) ── */}
                {(() => {
                  const numChildren = selectedPlan.format === 'solo' ? 1 : selectedPlan.format === 'duo' ? 2 : 3;
                  return (
                    <div className={`mb-6 p-5 rounded-2xl border-2 ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-indigo-50/40 border-indigo-200'}`}>
                      <h4 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <span className="text-xl">👨‍👩‍👧{numChildren >= 3 ? '‍👦' : ''}</span>
                        {numChildren === 1
                          ? (currentLang === 'FR' ? "Informations sur l'enfant" : currentLang === 'EN' ? 'Child information' : 'Informationen zum Kind')
                          : (currentLang === 'FR' ? `Informations sur les ${numChildren} enfants` : currentLang === 'EN' ? `Information about the ${numChildren} children` : `Informationen über die ${numChildren} Kinder`)}
                      </h4>
                      <div className="space-y-4">
                        {Array.from({ length: numChildren }).map((_, idx) => (
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
                                  value={planFormData.children[idx].name}
                                  onChange={e => {
                                    const newChildren = [...planFormData.children];
                                    newChildren[idx] = { ...newChildren[idx], name: e.target.value };
                                    setPlanFormData({ ...planFormData, children: newChildren });
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
                                  min="7"
                                  max="15"
                                  value={planFormData.children[idx].age}
                                  onChange={e => {
                                    const newChildren = [...planFormData.children];
                                    newChildren[idx] = { ...newChildren[idx], age: e.target.value };
                                    setPlanFormData({ ...planFormData, children: newChildren });
                                  }}
                                  required
                                  className={`w-full px-3 py-2 rounded-lg border focus:border-[#232999] focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {numChildren > 1 && (
                        <p className={`text-xs mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <i className="ri-information-line mr-1"></i>
                          {currentLang === 'FR'
                            ? `Le tarif de ${selectedPlan.price} CHF/mois inclut les ${numChildren} enfants (cours partagé).`
                            : currentLang === 'EN'
                            ? `The ${selectedPlan.price} CHF/month price includes the ${numChildren} children (shared class).`
                            : `Der Preis von ${selectedPlan.price} CHF/Monat umfasst die ${numChildren} Kinder (gemeinsamer Kurs).`}
                        </p>
                      )}
                    </div>
                  );
                })()}

                <div className="mb-6">
                  <label htmlFor="plan-message" className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {currentLang === 'FR' ? 'Message ou questions (optionnel)' : currentLang === 'EN' ? 'Message or questions (optional)' : 'Nachricht oder Fragen (optional)'}
                  </label>
                  <textarea id="plan-message" name="message" value={planFormData.message} onChange={e => setPlanFormData({ ...planFormData, message: e.target.value })} rows={3} className={`w-full px-4 py-3 rounded-xl border focus:border-[#232999] focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`} />
                </div>

                {planSubmitMessage === 'error' && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    <i className="ri-error-warning-line mr-1"></i>
                    {currentLang === 'FR' ? "Une erreur est survenue. Merci de nous écrire à contact@smartkids-school.ch ou via WhatsApp." : currentLang === 'EN' ? 'Something went wrong. Please email us or use WhatsApp.' : 'Ein Fehler ist aufgetreten. Bitte E-Mail oder WhatsApp.'}
                  </div>
                )}

                {planSubmitMessage === 'error_missing_child' && (
                  <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                    <i className="ri-error-warning-line mr-1"></i>
                    {currentLang === 'FR' ? "Merci de remplir le prénom et l'âge de chaque enfant." : currentLang === 'EN' ? 'Please fill in first name and age for each child.' : 'Bitte füllen Sie Vorname und Alter für jedes Kind aus.'}
                  </div>
                )}

                {planSubmitMessage === 'redirecting' && (
                  <div className="mb-4 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-200 text-emerald-700 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                      <div>
                        <p className="font-bold">{currentLang === 'FR' ? '✓ Inscription enregistrée !' : currentLang === 'EN' ? '✓ Enrollment recorded!' : '✓ Anmeldung erfasst!'}</p>
                        <p className="mt-1">{currentLang === 'FR' ? 'Redirection vers le paiement sécurisé Stripe…' : currentLang === 'EN' ? 'Redirecting to secure Stripe payment…' : 'Weiterleitung zur sicheren Stripe-Zahlung…'}</p>
                      </div>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={planSubmitting || planSubmitMessage === 'redirecting'} className="w-full bg-gradient-to-r from-[#232999] to-indigo-600 text-white px-6 py-4 rounded-full font-bold hover:shadow-xl transition-all duration-300 cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed">
                  {planSubmitting
                    ? (currentLang === 'FR' ? 'Envoi en cours…' : currentLang === 'EN' ? 'Sending…' : 'Wird gesendet…')
                    : (currentLang === 'FR' ? '🔒 Procéder au paiement sécurisé' : currentLang === 'EN' ? '🔒 Proceed to secure payment' : '🔒 Zur sicheren Zahlung')}
                </button>

                <p className={`text-xs text-center mt-4 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  <i className="ri-shield-check-line mr-1 text-emerald-500"></i>
                  {currentLang === 'FR' ? 'Paiement sécurisé via Stripe · Garantie 1ère séance remboursée' : currentLang === 'EN' ? 'Secure payment via Stripe · 1st session refund guarantee' : 'Sichere Zahlung über Stripe · 1.-Sitzung-Rückerstattungsgarantie'}
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
