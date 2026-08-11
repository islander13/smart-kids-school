// ─────────────────────────────────────────────────────────────────────────
// Contenu de l'espace membre ("Mon espace" — /espace).
// ─────────────────────────────────────────────────────────────────────────
// SEUL fichier à modifier pour ajouter, retirer ou réordonner une vidéo, une
// ressource ou un quiz : aucun composant ne doit être touché pour ça. Chaque
// vidéo est embarquée depuis YouTube (en mode non répertorié) ou Vimeo —
// jamais de fichier vidéo hébergé directement sur Netlify.
//
// Pour ajouter une vidéo : copier un item existant dans la bonne section,
// changer id/title/description/durationMinutes/provider/embedId.
// Pour ajouter une section : ajouter un objet à ESPACE_SECTIONS, avec sa clé
// unique (key) et son titre trilingue.
//
// Pour ajouter une ressource téléchargeable : déposer le fichier dans
// public/resources/ (ex: public/resources/exercices-scratch-1.pdf devient
// accessible à /resources/exercices-scratch-1.pdf), puis ajouter un item au
// tableau `resources` de la section avec ce chemin comme `url`. Un lien
// externe (Google Drive, etc.) fonctionne aussi tel quel.
//
// Pour ajouter un quiz de fin de section : renseigner `quiz` sur la section,
// avec ses questions (choix unique ou multiple) et `passThreshold` (ex: 0.7
// = 70% de bonnes réponses pour valider). Une section sans `quiz` n'a pas de
// barrière de quiz pour débloquer son badge (seules les vidéos comptent).
//
// La progression (vidéos vues, scores de quiz, badges) n'est PAS stockée
// ici : elle vit dans le compte de chaque utilisateur (voir
// src/contexts/AuthContext.tsx et src/utils/progress.ts). Ce fichier ne
// décrit que le contenu, jamais qui a fait quoi.
// ─────────────────────────────────────────────────────────────────────────

// Interrupteur unique : affiche/masque le lien "Mon espace" dans la
// navigation sur tout le site. /espace reste, dans tous les cas, accessible
// par URL directe : ce flag ne fait QUE changer la visibilité du lien, pas
// le contrôle d'accès. Ce dernier vit entièrement côté Netlify Identity
// (Site settings > Identity > Registration : "Invite only" — voir aussi
// l'invitation automatique après paiement dans stripe-webhook.js).
export const ESPACE_NAV_VISIBLE = true;

export type VideoProvider = 'youtube' | 'vimeo';

export interface LocalizedText {
  FR: string;
  EN: string;
  DE: string;
}

export interface EspaceVideo {
  /** Identifiant unique et stable (utilisé comme clé React, jamais affiché). */
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  /** Durée approximative en minutes, affichée telle quelle (ex: 12 → "12 min"). */
  durationMinutes: number;
  provider: VideoProvider;
  /**
   * ID YouTube (ex: "dQw4w9WgXcQ", pas l'URL complète) ou ID Vimeo (ex:
   * "76979871"). La miniature est déduite automatiquement pour YouTube ; pour
   * Vimeo, fournir `thumbnail` explicitement (Vimeo n'expose pas d'URL de
   * miniature prévisible à partir du seul ID).
   */
  embedId: string;
  /** Miniature optionnelle : par défaut, déduite du provider (YouTube uniquement). */
  thumbnail?: string;
}

export type ResourceType = 'pdf' | 'fiche' | 'projet';

export interface EspaceResource {
  /** Identifiant unique et stable. */
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  type: ResourceType;
  /** Chemin local (/resources/...) ou URL externe complète. */
  url: string;
}

export interface QuizOption {
  id: string;
  label: LocalizedText;
}

export interface QuizQuestion {
  id: string;
  prompt: LocalizedText;
  /** true = plusieurs réponses possibles (cases à cocher), false = une seule (choix unique). */
  multiple: boolean;
  options: QuizOption[];
  /** ids des options correctes ; pour multiple=false, un seul id. */
  correctOptionIds: string[];
  /** Court retour affiché après correction, quelle que soit la réponse donnée. */
  feedback?: LocalizedText;
}

export interface EspaceQuiz {
  /** Proportion de bonnes réponses (0 à 1) requise pour valider le quiz, ex: 0.7 = 70%. */
  passThreshold: number;
  questions: QuizQuestion[];
}

export interface EspaceSection {
  key: string;
  title: LocalizedText;
  videos: EspaceVideo[];
  resources: EspaceResource[];
  /** Absent = pas de quiz pour cette section (le badge ne dépend alors que des vidéos). */
  quiz?: EspaceQuiz;
}

export const ESPACE_SECTIONS: EspaceSection[] = [
  {
    key: 'bien-demarrer',
    title: { FR: 'Bien démarrer', EN: 'Getting started', DE: 'Erste Schritte' },
    videos: [
      {
        id: 'intro-bienvenue',
        title: {
          FR: "Bienvenue chez Smart Kids School",
          EN: 'Welcome to Smart Kids School',
          DE: 'Willkommen bei Smart Kids School',
        },
        description: {
          FR: "Une courte présentation de comment se déroulent les cours et comment utiliser cet espace.",
          EN: 'A short overview of how classes work and how to use this space.',
          DE: 'Ein kurzer Überblick, wie die Kurse ablaufen und wie Sie diesen Bereich nutzen.',
        },
        durationMinutes: 3,
        provider: 'youtube',
        embedId: 'REPLACE_WITH_YOUTUBE_ID',
      },
      {
        id: 'installer-scratch',
        title: {
          FR: 'Comment installer Scratch',
          EN: 'How to install Scratch',
          DE: 'Scratch installieren',
        },
        description: {
          FR: "Le guide pas à pas pour installer Scratch sur l'ordinateur de votre enfant avant la première séance.",
          EN: "Step-by-step guide to install Scratch on your child's computer before the first session.",
          DE: 'Schritt-für-Schritt-Anleitung zur Installation von Scratch vor der ersten Sitzung.',
        },
        durationMinutes: 5,
        provider: 'youtube',
        embedId: 'REPLACE_WITH_YOUTUBE_ID',
      },
    ],
    resources: [
      {
        id: 'fiche-installation-scratch',
        title: {
          FR: "Fiche d'installation (PDF)",
          EN: 'Installation sheet (PDF)',
          DE: 'Installationsanleitung (PDF)',
        },
        description: {
          FR: "Le même guide que la vidéo, en version imprimable.",
          EN: 'The same guide as the video, in printable form.',
          DE: 'Dieselbe Anleitung wie im Video, zum Ausdrucken.',
        },
        type: 'pdf',
        url: '/resources/fiche-installation-scratch.pdf',
      },
      {
        id: 'carnet-jeune-codeur-scratch',
        title: {
          FR: 'Carnet du jeune codeur (PDF)',
          EN: "Young coder's notebook (PDF)",
          DE: 'Heft für junge Programmierer:innen (PDF)',
        },
        description: {
          FR: "Un carnet d'activités à imprimer pour pratiquer ce que vous avez appris.",
          EN: 'A printable activity booklet to practice what you have learned.',
          DE: 'Ein ausdruckbares Übungsheft, um das Gelernte zu vertiefen.',
        },
        type: 'pdf',
        url: '/resources/carnet-jeune-codeur-scratch.pdf',
      },
    ],
    quiz: {
      passThreshold: 0.7,
      questions: [
        {
          id: 'q1-blocs-couleur',
          prompt: {
            FR: 'Avec quoi assemble-t-on un programme dans Scratch ?',
            EN: 'What do you use to build a program in Scratch?',
            DE: 'Womit setzt man ein Programm in Scratch zusammen?',
          },
          multiple: false,
          options: [
            { id: 'a', label: { FR: 'Des blocs de couleur', EN: 'Colored blocks', DE: 'Bunte Blöcke' } },
            { id: 'b', label: { FR: 'Des lignes de texte compliquées', EN: 'Complicated lines of text', DE: 'Komplizierte Textzeilen' } },
            { id: 'c', label: { FR: 'Des dessins uniquement', EN: 'Only drawings', DE: 'Nur Zeichnungen' } },
            { id: 'd', label: { FR: 'Des chiffres seulement', EN: 'Only numbers', DE: 'Nur Zahlen' } },
          ],
          correctOptionIds: ['a'],
          feedback: {
            FR: 'Exact ! Dans Scratch, on assemble des blocs colorés, comme des LEGO. Pas besoin d’écrire du texte.',
            EN: 'Exactly! In Scratch, you snap together colored blocks, like LEGO. No need to write text.',
            DE: 'Genau! In Scratch setzt man bunte Blöcke zusammen, wie bei LEGO. Kein Text nötig.',
          },
        },
        {
          id: 'q2-drapeau-vert',
          prompt: {
            FR: 'Sur quel bouton clique-t-on pour lancer son programme ?',
            EN: 'Which button do you click to start your program?',
            DE: 'Auf welchen Knopf klickt man, um sein Programm zu starten?',
          },
          multiple: false,
          options: [
            { id: 'a', label: { FR: 'Le drapeau vert', EN: 'The green flag', DE: 'Die grüne Flagge' } },
            { id: 'b', label: { FR: 'Le bouton rouge', EN: 'The red button', DE: 'Den roten Knopf' } },
            { id: 'c', label: { FR: 'La barre espace', EN: 'The space bar', DE: 'Die Leertaste' } },
            { id: 'd', label: { FR: 'Le logo Scratch', EN: 'The Scratch logo', DE: 'Das Scratch-Logo' } },
          ],
          correctOptionIds: ['a'],
          feedback: {
            FR: "Bravo ! Le drapeau vert lance ton programme. Le bouton rouge, lui, l'arrête.",
            EN: 'Well done! The green flag starts your program. The red button stops it.',
            DE: 'Super! Die grüne Flagge startet dein Programm. Der rote Knopf stoppt es.',
          },
        },
        {
          id: 'q3-scratch-gratuit',
          prompt: {
            FR: 'Où trouve-t-on Scratch gratuitement ?',
            EN: 'Where can you find Scratch for free?',
            DE: 'Wo findet man Scratch kostenlos?',
          },
          multiple: false,
          options: [
            { id: 'a', label: { FR: "Il faut l'acheter en magasin", EN: 'You have to buy it in a store', DE: 'Man muss es im Laden kaufen' } },
            { id: 'b', label: { FR: 'scratch.mit.edu', EN: 'scratch.mit.edu', DE: 'scratch.mit.edu' } },
            { id: 'c', label: { FR: 'Uniquement sur une console de jeu', EN: 'Only on a game console', DE: 'Nur auf einer Spielkonsole' } },
            { id: 'd', label: { FR: 'Il faut être développeur pour y accéder', EN: 'You need to be a developer to access it', DE: 'Man muss Entwickler:in sein, um Zugang zu haben' } },
          ],
          correctOptionIds: ['b'],
          feedback: {
            FR: 'Oui ! Scratch est 100% gratuit sur scratch.mit.edu, développé par le MIT.',
            EN: 'Yes! Scratch is 100% free at scratch.mit.edu, developed by MIT.',
            DE: 'Ja! Scratch ist 100% kostenlos auf scratch.mit.edu, entwickelt vom MIT.',
          },
        },
      ],
    },
  },
  {
    key: 'mes-cours-scratch',
    title: { FR: 'Mes cours Scratch', EN: 'My Scratch lessons', DE: 'Meine Scratch-Kurse' },
    videos: [],
    resources: [],
    quiz: {
      passThreshold: 0.7,
      questions: [
        {
          id: 'q4-boucle',
          prompt: {
            FR: 'À quoi sert une « boucle » (le bloc « répéter ») ?',
            EN: "What is a 'loop' (the 'repeat' block) for?",
            DE: 'Wofür ist eine „Schleife" (der Block „wiederhole") da?',
          },
          multiple: false,
          options: [
            { id: 'a', label: { FR: 'À répéter une action plusieurs fois', EN: 'Repeating an action several times', DE: 'Um eine Aktion mehrmals zu wiederholen' } },
            { id: 'b', label: { FR: 'À effacer le programme', EN: 'Erasing the program', DE: 'Um das Programm zu löschen' } },
            { id: 'c', label: { FR: 'À changer la couleur du chat', EN: "Changing the cat's color", DE: 'Um die Farbe der Katze zu ändern' } },
            { id: 'd', label: { FR: 'À fermer Scratch', EN: 'Closing Scratch', DE: 'Um Scratch zu schliessen' } },
          ],
          correctOptionIds: ['a'],
          feedback: {
            FR: 'Exact ! Une boucle répète une action sans avoir à recopier le bloc plein de fois.',
            EN: 'Exactly! A loop repeats an action without having to copy the block over and over.',
            DE: 'Genau! Eine Schleife wiederholt eine Aktion, ohne den Block immer wieder kopieren zu müssen.',
          },
        },
        {
          id: 'q5-repeter-indefiniment',
          prompt: {
            FR: 'Que fait le bloc « répéter indéfiniment » ?',
            EN: "What does the 'repeat forever' block do?",
            DE: 'Was macht der Block „fortlaufend wiederholen"?',
          },
          multiple: false,
          options: [
            { id: 'a', label: { FR: 'Il répète l’action une seule fois', EN: 'It repeats the action only once', DE: 'Er wiederholt die Aktion nur einmal' } },
            { id: 'b', label: { FR: 'Il attend 10 secondes', EN: 'It waits for 10 seconds', DE: 'Er wartet 10 Sekunden' } },
            { id: 'c', label: { FR: 'Il répète l’action en boucle, sans jamais s’arrêter', EN: 'It repeats the action in a loop, forever', DE: 'Er wiederholt die Aktion in einer Schleife, ohne aufzuhören' } },
            { id: 'd', label: { FR: 'Il fait disparaître le personnage', EN: 'It makes the character disappear', DE: 'Er lässt die Figur verschwinden' } },
          ],
          correctOptionIds: ['c'],
          feedback: {
            FR: 'Oui ! « Indéfiniment » veut dire « pour toujours ». Parfait pour un personnage qui bouge sans arrêt.',
            EN: "Yes! 'Forever' means 'always'. Perfect for a character that keeps moving non-stop.",
            DE: 'Ja! „Fortlaufend" bedeutet „für immer". Perfekt für eine Figur, die sich ständig bewegt.',
          },
        },
        {
          id: 'q6-variable',
          prompt: {
            FR: 'Une « variable » dans Scratch, c’est…',
            EN: "A 'variable' in Scratch is…",
            DE: 'Eine „Variable" in Scratch ist…',
          },
          multiple: false,
          options: [
            { id: 'a', label: { FR: 'Une boîte qui retient un nombre (comme le score)', EN: 'A box that stores a number (like the score)', DE: 'Eine Box, die sich eine Zahl merkt (wie die Punktzahl)' } },
            { id: 'b', label: { FR: 'Un nouveau personnage', EN: 'A new character', DE: 'Eine neue Figur' } },
            { id: 'c', label: { FR: 'Un arrière-plan', EN: 'A backdrop', DE: 'Ein Hintergrund' } },
            { id: 'd', label: { FR: 'Un son', EN: 'A sound', DE: 'Ein Ton' } },
          ],
          correctOptionIds: ['a'],
          feedback: {
            FR: 'Bravo ! Une variable est une boîte qui garde un nombre en mémoire, comme le score d’un jeu.',
            EN: "Well done! A variable is a box that remembers a number, like a game's score.",
            DE: 'Super! Eine Variable ist eine Box, die sich eine Zahl merkt, wie die Punktzahl in einem Spiel.',
          },
        },
        {
          id: 'q7-bloc-dire',
          prompt: {
            FR: 'Quel bloc utilise-t-on pour faire parler un personnage ?',
            EN: 'Which block do you use to make a character talk?',
            DE: 'Welchen Block verwendet man, damit eine Figur spricht?',
          },
          multiple: false,
          options: [
            { id: 'a', label: { FR: 'Le bloc « avancer de 10 pas »', EN: "The 'move 10 steps' block", DE: 'Den Block „gehe 10er-Schritte"' } },
            { id: 'b', label: { FR: 'Le bloc « dire … »', EN: "The 'say…' block", DE: 'Den Block „sage …"' } },
            { id: 'c', label: { FR: 'Le bloc « tourner »', EN: "The 'turn' block", DE: 'Den Block „drehe"' } },
            { id: 'd', label: { FR: 'Le bloc « attendre 1 seconde »', EN: "The 'wait 1 second' block", DE: 'Den Block „warte 1 Sekunde"' } },
          ],
          correctOptionIds: ['b'],
          feedback: {
            FR: 'Exact ! Le bloc « dire » (dans Apparence) affiche une bulle de texte au-dessus du personnage.',
            EN: "Exactly! The 'say' block (in Looks) shows a speech bubble above the character.",
            DE: 'Genau! Der Block „sage" (unter Aussehen) zeigt eine Sprechblase über der Figur.',
          },
        },
        {
          id: 'q8-aleatoire',
          prompt: {
            FR: 'Que signifie « aléatoire » (par exemple « nombre au hasard entre 1 et 10 ») ?',
            EN: "What does 'random' mean (e.g. 'pick random number between 1 and 10')?",
            DE: 'Was bedeutet „zufällig" (z. B. „Zufallszahl zwischen 1 und 10")?',
          },
          multiple: false,
          options: [
            { id: 'a', label: { FR: 'Toujours le même nombre', EN: 'Always the same number', DE: 'Immer dieselbe Zahl' } },
            { id: 'b', label: { FR: 'Au hasard : un résultat différent à chaque fois', EN: 'Random: a different result every time', DE: 'Zufällig: jedes Mal ein anderes Ergebnis' } },
            { id: 'c', label: { FR: 'Le plus grand nombre possible', EN: 'The biggest number possible', DE: 'Die grösstmögliche Zahl' } },
            { id: 'd', label: { FR: 'Une erreur dans le programme', EN: 'An error in the program', DE: 'Ein Fehler im Programm' } },
          ],
          correctOptionIds: ['b'],
          feedback: {
            FR: 'Oui ! « Aléatoire » = au hasard. C’est ce qui rend un jeu différent à chaque partie.',
            EN: "Yes! 'Random' means by chance. It's what makes a game different every time you play.",
            DE: 'Ja! „Zufällig" heisst nach dem Zufallsprinzip. Das macht ein Spiel bei jeder Runde anders.',
          },
        },
      ],
    },
  },
  {
    key: 'revisions-exercices',
    title: { FR: 'Révisions & exercices', EN: 'Review & practice', DE: 'Wiederholung & Übungen' },
    videos: [],
    resources: [],
    quiz: {
      passThreshold: 0.7,
      questions: [
        {
          id: 'q9-touche-pressee',
          prompt: {
            FR: 'Pour qu’un personnage réagisse quand on appuie sur une touche, on utilise…',
            EN: 'For a character to react when a key is pressed, you use…',
            DE: 'Damit eine Figur reagiert, wenn eine Taste gedrückt wird, benutzt man…',
          },
          multiple: false,
          options: [
            { id: 'a', label: { FR: 'Un bloc « quand touche … pressée »', EN: "A 'when key … pressed' block", DE: 'Einen Block „wenn Taste … gedrückt"' } },
            { id: 'b', label: { FR: 'Un bloc « avancer de 10 pas »', EN: "A 'move 10 steps' block", DE: 'Einen Block „gehe 10er-Schritte"' } },
            { id: 'c', label: { FR: 'Un bloc « cacher »', EN: "A 'hide' block", DE: 'Einen Block „verstecke"' } },
            { id: 'd', label: { FR: 'Un bloc « changer de costume »', EN: "A 'switch costume' block", DE: 'Einen Block „wechsle zu Kostüm"' } },
          ],
          correctOptionIds: ['a'],
          feedback: {
            FR: 'Exact ! Les blocs « quand touche pressée » rendent ton jeu interactif : le joueur agit.',
            EN: "Exactly! 'When key pressed' blocks make your game interactive: the player takes action.",
            DE: 'Genau! Die Blöcke „wenn Taste gedrückt" machen dein Spiel interaktiv: die spielende Person handelt.',
          },
        },
        {
          id: 'q10-position-y',
          prompt: {
            FR: 'Dans Scratch, « y » représente…',
            EN: "In Scratch, 'y' represents…",
            DE: 'In Scratch steht „y" für…',
          },
          multiple: false,
          options: [
            { id: 'a', label: { FR: 'La couleur du personnage', EN: "The character's color", DE: 'Die Farbe der Figur' } },
            { id: 'b', label: { FR: 'Le score', EN: 'The score', DE: 'Die Punktzahl' } },
            { id: 'c', label: { FR: 'La hauteur (position verticale)', EN: 'The height (vertical position)', DE: 'Die Höhe (senkrechte Position)' } },
            { id: 'd', label: { FR: 'La vitesse', EN: 'The speed', DE: 'Die Geschwindigkeit' } },
          ],
          correctOptionIds: ['c'],
          feedback: {
            FR: 'Bravo ! « y » est la hauteur. Augmenter « y » fait monter le personnage — utile pour un saut !',
            EN: "Well done! 'y' is the height. Increasing 'y' makes the character go up — useful for a jump!",
            DE: 'Super! „y" ist die Höhe. Ein grösseres „y" lässt die Figur nach oben gehen — nützlich für einen Sprung!',
          },
        },
        {
          id: 'q11-bug',
          prompt: {
            FR: 'Un « bug », c’est…',
            EN: "A 'bug' is…",
            DE: 'Ein „Bug" ist…',
          },
          multiple: false,
          options: [
            { id: 'a', label: { FR: 'Une erreur dans le programme, qu’on peut réparer', EN: 'An error in the program that can be fixed', DE: 'Ein Fehler im Programm, den man beheben kann' } },
            { id: 'b', label: { FR: 'Un personnage secret', EN: 'A secret character', DE: 'Eine geheime Figur' } },
            { id: 'c', label: { FR: 'Un niveau bonus', EN: 'A bonus level', DE: 'Ein Bonuslevel' } },
            { id: 'd', label: { FR: 'Un type de son', EN: 'A type of sound', DE: 'Eine Tonart' } },
          ],
          correctOptionIds: ['a'],
          feedback: {
            FR: 'Oui ! Un bug est une erreur. Même les pros en font : le jeu, c’est de le trouver et de le corriger.',
            EN: 'Yes! A bug is an error. Even pros make them: the fun part is finding and fixing it.',
            DE: 'Ja! Ein Bug ist ein Fehler. Sogar Profis machen welche: Die Kunst ist, ihn zu finden und zu beheben.',
          },
        },
        {
          id: 'q12-compteur-points',
          prompt: {
            FR: 'Pour créer un compteur de points, il faut d’abord…',
            EN: 'To create a points counter, you first need to…',
            DE: 'Um einen Punktezähler zu erstellen, muss man zuerst…',
          },
          multiple: false,
          options: [
            { id: 'a', label: { FR: 'Ajouter un nouvel arrière-plan', EN: 'Add a new backdrop', DE: 'Einen neuen Hintergrund hinzufügen' } },
            { id: 'b', label: { FR: 'Créer une variable (par exemple « Score »)', EN: "Create a variable (e.g. 'Score')", DE: 'Eine Variable erstellen (z. B. „Punktzahl")' } },
            { id: 'c', label: { FR: 'Changer de personnage', EN: 'Change character', DE: 'Die Figur wechseln' } },
            { id: 'd', label: { FR: 'Mettre un son', EN: 'Add a sound', DE: 'Einen Ton hinzufügen' } },
          ],
          correctOptionIds: ['b'],
          feedback: {
            FR: 'Exact ! On crée une variable « Score », puis on lui ajoute des points au fil du jeu.',
            EN: "Exactly! You create a 'Score' variable, then add points to it as the game goes on.",
            DE: 'Genau! Man erstellt eine Variable „Punktzahl" und fügt ihr dann im Spielverlauf Punkte hinzu.',
          },
        },
      ],
    },
  },
];
