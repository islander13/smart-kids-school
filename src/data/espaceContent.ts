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

// Interrupteur unique : masque le lien "Mon espace" de la navigation sur
// tout le site pendant qu'on finalise le contenu et qu'on teste (Identity,
// vidéos réelles, etc.), sans désactiver la page elle-même — /espace reste
// accessible par URL directe pour continuer à tester. Remettre à `true`
// quand l'espace est prêt à être annoncé publiquement.
export const ESPACE_NAV_VISIBLE = false;

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
        url: '/resources/REPLACE_WITH_FILE.pdf',
      },
    ],
    quiz: {
      passThreshold: 0.7,
      questions: [
        {
          id: 'q1-que-est-scratch',
          prompt: {
            FR: "Qu'est-ce que Scratch ?",
            EN: 'What is Scratch?',
            DE: 'Was ist Scratch?',
          },
          multiple: false,
          options: [
            { id: 'a', label: { FR: 'Un langage de programmation par blocs pour apprendre à coder', EN: 'A block-based programming language for learning to code', DE: 'Eine blockbasierte Programmiersprache zum Programmieren lernen' } },
            { id: 'b', label: { FR: 'Un jeu vidéo à télécharger', EN: 'A video game to download', DE: 'Ein herunterladbares Videospiel' } },
            { id: 'c', label: { FR: 'Un réseau social pour enfants', EN: 'A social network for kids', DE: 'Ein soziales Netzwerk für Kinder' } },
          ],
          correctOptionIds: ['a'],
          feedback: {
            FR: 'Scratch permet de créer des animations et des jeux en assemblant des blocs, sans écrire de texte.',
            EN: 'Scratch lets you build animations and games by snapping blocks together, without writing text.',
            DE: 'Mit Scratch erstellt man Animationen und Spiele durch Zusammensetzen von Blöcken, ohne Text zu schreiben.',
          },
        },
        {
          id: 'q2-avant-premiere-seance',
          prompt: {
            FR: "Que faut-il faire avant la première séance ?",
            EN: 'What should you do before the first session?',
            DE: 'Was sollte vor der ersten Sitzung erledigt werden?',
          },
          multiple: false,
          options: [
            { id: 'a', label: { FR: 'Rien, tout se fait sur place', EN: 'Nothing, everything happens on-site', DE: 'Nichts, alles findet vor Ort statt' } },
            { id: 'b', label: { FR: 'Installer Scratch sur son ordinateur', EN: 'Install Scratch on your computer', DE: 'Scratch auf dem Computer installieren' } },
          ],
          correctOptionIds: ['b'],
          feedback: {
            FR: "Installer Scratch à l'avance permet de ne pas perdre de temps au début du premier cours.",
            EN: 'Installing Scratch in advance avoids wasting time at the start of the first class.',
            DE: 'Scratch im Voraus zu installieren spart Zeit zu Beginn der ersten Stunde.',
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
  },
  {
    key: 'revisions-exercices',
    title: { FR: 'Révisions & exercices', EN: 'Review & practice', DE: 'Wiederholung & Übungen' },
    videos: [],
    resources: [],
  },
];
