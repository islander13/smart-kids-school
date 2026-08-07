// ─────────────────────────────────────────────────────────────────────────
// Contenu de l'espace membre ("Mon espace" — /espace).
// ─────────────────────────────────────────────────────────────────────────
// SEUL fichier à modifier pour ajouter, retirer ou réordonner une vidéo :
// aucun composant ne doit être touché pour ça. Chaque vidéo est embarquée
// depuis YouTube (en mode non répertorié) ou Vimeo — jamais de fichier vidéo
// hébergé directement sur Netlify.
//
// Pour ajouter une vidéo : copier un item existant dans la bonne section,
// changer id/title/description/durationMinutes/provider/embedId.
// Pour ajouter une section : ajouter un objet à ESPACE_SECTIONS, avec sa clé
// unique (key) et son titre trilingue.
//
// Volontairement minimal pour cette V1 : pas de champ de suivi de
// progression (vu/non vu), pas de lien quiz/exercice, pas de contrôle
// d'accès par vidéo. Ces champs pourront être ajoutés plus tard sans casser
// la structure existante (ce sont des extensions additives).
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

export interface EspaceSection {
  key: string;
  title: LocalizedText;
  videos: EspaceVideo[];
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
  },
  {
    key: 'mes-cours-scratch',
    title: { FR: 'Mes cours Scratch', EN: 'My Scratch lessons', DE: 'Meine Scratch-Kurse' },
    videos: [],
  },
  {
    key: 'revisions-exercices',
    title: { FR: 'Révisions & exercices', EN: 'Review & practice', DE: 'Wiederholung & Übungen' },
    videos: [],
  },
];
