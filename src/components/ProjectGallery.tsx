import type { Locale } from '../i18n/routing';

// ─────────────────────────────────────────────────────────────────────────
// Galerie de projets d'élèves (preuve sociale) — utilisée sur l'accueil et
// /tarifs. Extrait ici pour que les deux pages restent identiques sans
// dupliquer la liste de projets/le balisage : avant, un 7e projet ajouté
// d'un côté aurait pu facilement être oublié de l'autre.
// ─────────────────────────────────────────────────────────────────────────

const PROJECTS = [
  { name: 'Jonas', age: 8, file: 'Scratch 1', city: 'Lausanne', course: 'Scratch Basics', date: 'Mars 2025' },
  { name: 'Emma', age: 11, file: 'Scratch 2', city: 'Genève', course: 'Advanced Scratch', date: 'Juin 2025' },
  { name: 'Alex', age: 12, file: 'Scratch 3', city: 'Morges', course: 'Advanced Scratch', date: 'Nov. 2025' },
  { name: 'Victor', age: 13, file: 'Scratch 4', city: 'Nyon', course: 'Advanced Scratch', date: 'Févr. 2026' },
  { name: 'Valentin', age: 14, file: 'Python Turtle 1', city: 'Lausanne', course: 'Python Turtle', date: 'Mars 2026' },
  { name: 'Nadine', age: 14, file: 'Python Turtle 2', city: 'Genève', course: 'Python Turtle', date: 'Mai 2026' },
];

export default function ProjectGallery({ darkMode, currentLang, eyebrow, title, description, bgClass, large, id }: {
  darkMode: boolean;
  currentLang: Locale;
  eyebrow: string;
  title: string;
  description: string;
  /** Fond de la section — chaque page contrôle son alternance de couleurs autour de la galerie. */
  bgClass: string;
  /** Taille du titre : true = grand (accueil), false = aligné sur les autres titres de section (tarifs). */
  large?: boolean;
  /** Ancre optionnelle (ex: un lien "#realisations" pointant vers cette section ailleurs sur la page). */
  id?: string;
}) {
  return (
    <section id={id} className={`py-20 px-4 transition-colors duration-300 ${bgClass}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className={darkMode ? 'text-indigo-400 font-semibold text-sm uppercase tracking-wider' : 'text-[#232999] font-semibold text-sm uppercase tracking-wider'}>
            {eyebrow}
          </span>
          <h2 className={`font-bold mt-3 mb-4 ${large ? 'text-4xl lg:text-5xl' : 'text-3xl lg:text-4xl'} ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h2>
          <p className={`max-w-2xl mx-auto ${large ? 'text-lg' : 'text-base'} ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PROJECTS.map((s, i) => (
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
                <p className={darkMode ? 'text-sm font-semibold text-indigo-400 mt-0.5' : 'text-sm font-semibold text-[#232999] mt-0.5'}>{s.course}</p>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{s.city} · {s.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
