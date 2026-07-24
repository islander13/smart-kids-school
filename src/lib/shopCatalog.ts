import type { Locale } from '../i18n/routing';

// ─────────────────────────────────────────────────────────────────────────
// Catalogue des produits de la boutique (ebooks...), affiché sur les pages
// src/pages/shop/*.
//
// ⚠️ Le prix ici est uniquement pour l'AFFICHAGE. Le prix réellement facturé
// vient de netlify/functions/lib/shopProducts.js (source de vérité) — les
// deux doivent être tenus synchronisés à la main.
//
// ⚠️ Prix placeholder (faciles à ajuster) — le fichier PDF de chaque livre
// doit encore être déposé dans le store Netlify Blobs "ebooks" (voir
// netlify/functions/shop-download.js) avant toute mise en service.
// ─────────────────────────────────────────────────────────────────────────

export interface ShopProduct {
  slug: string;
  priceCHF: number;
  emoji: string; // repère visuel en attendant une vraie couverture (voir coverImage)
  coverImage?: string; // chemin dans /public, ex: '/shop/mon-ebook-cover.png' — optionnel tant qu'absent
  title: Record<Locale, string>;
  tagline: Record<Locale, string>;
  description: Record<Locale, string>;
}

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    slug: 'carnet-jeune-codeur-scratch',
    priceCHF: 15,
    emoji: '📘',
    title: {
      FR: 'Le carnet du jeune codeur — 30 défis Scratch à faire en famille',
      EN: 'The Young Coder\'s Notebook — 30 Scratch challenges to do as a family',
      DE: 'Das Heft des jungen Programmierers — 30 Scratch-Herausforderungen für die ganze Familie',
    },
    tagline: {
      FR: '30 mini-défis progressifs, de la première animation au jeu jouable. Une page par défi, aucune connaissance requise du parent. Dès 7 ans.',
      EN: '30 progressive mini-challenges, from the first animation to a playable game. One page per challenge, no prior knowledge required from parents. From age 7.',
      DE: '30 aufeinander aufbauende Mini-Herausforderungen, von der ersten Animation bis zum spielbaren Spiel. Eine Seite pro Herausforderung, keine Vorkenntnisse der Eltern nötig. Ab 7 Jahren.',
    },
    description: {
      FR: "Un carnet à faire ensemble, pas à lire seul dans son coin : chaque défi tient sur une page, avec un objectif clair, un indice si besoin, et un espace pour noter ce qui a été essayé. Les 30 défis suivent une vraie progression — les dix premiers posent les bases (bouger un personnage, réagir à une touche, répéter une action), les suivants introduisent des règles de jeu, et les derniers assemblent tout ça dans un jeu complet que l'enfant peut montrer. Le parent n'a besoin d'aucune connaissance en programmation : son rôle est d'accompagner, pas d'expliquer. Compte environ 15 à 20 minutes par défi.",
      EN: "A notebook meant to be worked through together, not read alone in a corner: each challenge fits on one page, with a clear goal, a hint if needed, and space to note what was tried. The 30 challenges follow a real progression — the first ten lay the basics (moving a character, reacting to a key press, repeating an action), the next ones introduce game rules, and the last ones bring it all together into a complete game the child can show off. No programming knowledge is required from the parent: their role is to accompany, not to explain. About 15 to 20 minutes per challenge.",
      DE: "Ein Heft zum gemeinsamen Bearbeiten, nicht zum alleinigen Lesen in der Ecke: Jede Herausforderung passt auf eine Seite, mit klarem Ziel, einem Tipp bei Bedarf und Platz, um festzuhalten, was ausprobiert wurde. Die 30 Herausforderungen folgen einem echten Aufbau — die ersten zehn legen die Grundlagen (eine Figur bewegen, auf einen Tastendruck reagieren, eine Aktion wiederholen), die nächsten führen Spielregeln ein, und die letzten fügen alles zu einem vollständigen Spiel zusammen, das das Kind vorzeigen kann. Die Eltern brauchen keinerlei Programmierkenntnisse: Ihre Rolle ist es zu begleiten, nicht zu erklären. Etwa 15 bis 20 Minuten pro Herausforderung.",
    },
  },
  {
    slug: 'logique-avant-le-code',
    priceCHF: 15,
    emoji: '🧩',
    title: {
      FR: 'La logique avant le code — 25 jeux de raisonnement pour les 7-11 ans',
      EN: 'Logic Before Code — 25 reasoning games for ages 7-11',
      DE: 'Logik vor dem Code — 25 Denkspiele für 7- bis 11-Jährige',
    },
    tagline: {
      FR: 'Séquences, boucles, conditions : les mécanismes de la programmation, expliqués par des énigmes et des jeux papier. Sans écran.',
      EN: 'Sequences, loops, conditions: the mechanics of programming, explained through puzzles and paper games. No screen required.',
      DE: 'Sequenzen, Schleifen, Bedingungen: die Mechanismen des Programmierens, erklärt durch Rätsel und Papierspiele. Ganz ohne Bildschirm.',
    },
    description: {
      FR: "Ce livre ne contient pas une ligne de code : c'est délibéré. Avant d'écrire un programme, un enfant a besoin de comprendre ce qu'est une instruction précise, une répétition, une condition — des notions qu'on peut enseigner avec un crayon et du papier, sans ordinateur. Les 25 jeux (labyrinthes à instructions, énigmes de séquençage, petits problèmes de logique) reprennent chacun un mécanisme qu'on retrouve ensuite tel quel en Scratch ou en Python. C'est un excellent point de départ pour un enfant qui n'a jamais touché à la programmation, ou un bon complément pour consolider les bases entre deux séances de code à l'écran.",
      EN: "This book doesn't contain a single line of code — that's deliberate. Before writing a program, a child needs to understand what a precise instruction is, what a repetition is, what a condition is — concepts that can be taught with a pencil and paper, no computer required. Each of the 25 games (instruction mazes, sequencing puzzles, small logic problems) covers a mechanism the child will later find, unchanged, in Scratch or Python. It's an excellent starting point for a child who has never touched programming, or a good complement to reinforce the basics between screen-based coding sessions.",
      DE: "Dieses Buch enthält keine einzige Zeile Code — das ist Absicht. Bevor ein Kind ein Programm schreibt, muss es verstehen, was eine präzise Anweisung, eine Wiederholung, eine Bedingung ist — Konzepte, die sich mit Bleistift und Papier vermitteln lassen, ganz ohne Computer. Jedes der 25 Spiele (Anweisungs-Labyrinthe, Sequenzierungsrätsel, kleine Logikprobleme) behandelt einen Mechanismus, den das Kind später unverändert in Scratch oder Python wiederfindet. Ein hervorragender Einstieg für ein Kind, das noch nie programmiert hat, oder eine gute Ergänzung, um die Grundlagen zwischen Bildschirm-Sitzungen zu festigen.",
    },
  },
  {
    slug: 'python-pour-les-enfants',
    priceCHF: 24,
    emoji: '🐍',
    title: {
      FR: 'Python pour les enfants — Du premier programme au premier jeu',
      EN: 'Python for Kids — From first program to first game',
      DE: 'Python für Kinder — Vom ersten Programm zum ersten Spiel',
    },
    tagline: {
      FR: 'Un parcours guidé, pas à pas, avec 12 projets complets. Pensé pour les 10-15 ans qui veulent passer de Scratch au vrai code.',
      EN: 'A guided, step-by-step journey with 12 complete projects. Designed for 10-15 year-olds ready to move from Scratch to real code.',
      DE: 'Ein geführter Weg, Schritt für Schritt, mit 12 vollständigen Projekten. Für 10- bis 15-Jährige, die von Scratch zu echtem Code wechseln möchten.',
    },
    description: {
      FR: "Le passage de Scratch à un vrai langage textuel est le cap le plus intimidant du parcours d'un jeune codeur — ce livre le découpe en étapes gérables. Il commence par Python Turtle (dessiner à l'écran avec du code, pour garder un résultat visuel immédiat), puis introduit variables, boucles et conditions une par une, chacune illustrée par un petit projet complet plutôt qu'un exercice abstrait. Les 12 projets vont du dessin géométrique au jeu de devinette, jusqu'à un mini-jeu avec plusieurs niveaux en fin de parcours. Chaque chapitre part du principe que l'enfant a déjà les bases de la logique (via Scratch ou équivalent) — ce n'est pas un livre pour un tout premier contact avec la programmation.",
      EN: "The move from Scratch to a real text-based language is the most intimidating step in a young coder's journey — this book breaks it down into manageable stages. It starts with Python Turtle (drawing on screen with code, to keep an immediate visual result), then introduces variables, loops and conditions one at a time, each illustrated with a small complete project rather than an abstract exercise. The 12 projects range from geometric drawing to a guessing game, up to a multi-level mini-game by the end. Each chapter assumes the child already has the basics of logic (via Scratch or equivalent) — this isn't a book for a first-ever contact with programming.",
      DE: "Der Übergang von Scratch zu einer echten Textsprache ist der einschüchterndste Schritt auf dem Weg eines jungen Programmierers — dieses Buch zerlegt ihn in überschaubare Etappen. Es beginnt mit Python Turtle (Zeichnen auf dem Bildschirm mit Code, für ein sofortiges visuelles Ergebnis), führt dann Variablen, Schleifen und Bedingungen einzeln ein, jede anhand eines kleinen, vollständigen Projekts statt einer abstrakten Übung. Die 12 Projekte reichen vom geometrischen Zeichnen über ein Ratespiel bis zu einem Mini-Spiel mit mehreren Levels am Ende. Jedes Kapitel setzt voraus, dass das Kind bereits logische Grundlagen hat (über Scratch oder Ähnliches) — dies ist kein Buch für den allerersten Kontakt mit dem Programmieren.",
    },
  },
  {
    slug: 'guide-parent-ia',
    priceCHF: 12,
    emoji: '🤖',
    title: {
      FR: "Le guide du parent face à l'IA — Comprendre pour accompagner",
      EN: 'The Parent\'s Guide to AI — Understand, to support',
      DE: 'Der Eltern-Leitfaden zu KI — Verstehen, um zu begleiten',
    },
    tagline: {
      FR: "Ce que votre enfant doit savoir sur l'intelligence artificielle, et ce que vous devez savoir pour en parler avec lui. Sans jargon, sans catastrophisme.",
      EN: "What your child needs to know about artificial intelligence, and what you need to know to talk about it with them. No jargon, no doom-mongering.",
      DE: "Was Ihr Kind über künstliche Intelligenz wissen sollte, und was Sie wissen müssen, um mit ihm darüber zu sprechen. Ohne Fachjargon, ohne Panikmache.",
    },
    description: {
      FR: "Ce livre n'est pas destiné aux enfants, mais aux parents — c'est le seul de la collection dans ce cas. Il répond à une question simple : comment accompagner un enfant qui grandit avec des outils d'intelligence artificielle omniprésents, sans soi-même être expert du sujet ? Sans jargon technique, il explique ce qu'une IA fait réellement (et ce qu'elle ne fait pas), pourquoi elle peut se tromper avec assurance, et comment aider son enfant à développer un regard critique plutôt qu'une confiance ou une méfiance aveugle. Le ton reste délibérément mesuré : ni promesse de révolution, ni alarmisme — juste de quoi avoir une conversation informée à la maison.",
      EN: "This book isn't for children — it's the only one in the collection meant for parents. It answers a simple question: how do you support a child growing up surrounded by AI tools without being an expert yourself? Without technical jargon, it explains what an AI actually does (and doesn't do), why it can be confidently wrong, and how to help your child build critical judgment rather than blind trust or blind distrust. The tone stays deliberately measured: no promise of revolution, no doom-mongering — just enough to have an informed conversation at home.",
      DE: "Dieses Buch richtet sich nicht an Kinder — es ist das einzige der Sammlung, das für Eltern gedacht ist. Es beantwortet eine einfache Frage: Wie begleitet man ein Kind, das mit allgegenwärtigen KI-Werkzeugen aufwächst, ohne selbst Expertin oder Experte zu sein? Ohne Fachjargon erklärt es, was eine KI tatsächlich tut (und was nicht), warum sie sich selbstbewusst irren kann, und wie man dem Kind hilft, ein kritisches Urteilsvermögen statt blindes Vertrauen oder blinde Skepsis zu entwickeln. Der Ton bleibt bewusst massvoll: kein Versprechen einer Revolution, keine Panikmache — nur genug, um zu Hause ein informiertes Gespräch führen zu können.",
    },
  },
];

export function getShopProduct(slug: string): ShopProduct | undefined {
  return SHOP_PRODUCTS.find(p => p.slug === slug);
}
