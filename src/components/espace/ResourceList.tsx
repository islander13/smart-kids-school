import type { EspaceResource, ResourceType } from '../../data/espaceContent';
import type { Locale } from '../../i18n/routing';

const T: Record<Locale, { title: string }> = {
  FR: { title: 'Ressources' },
  EN: { title: 'Resources' },
  DE: { title: 'Materialien' },
};

const TYPE_ICON: Record<ResourceType, string> = {
  pdf: 'ri-book-open-line',
  fiche: 'ri-pencil-ruler-2-line',
  projet: 'ri-code-box-line',
};

export default function ResourceList({ resources, darkMode, currentLang }: {
  resources: EspaceResource[];
  darkMode: boolean;
  currentLang: Locale;
}) {
  const t = T[currentLang];
  if (resources.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className={`text-sm font-bold uppercase tracking-wide mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.title}</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {resources.map(resource => (
          <a
            key={resource.id}
            href={resource.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all hover:shadow-md ${darkMode ? 'border-gray-700 bg-gray-800/50 hover:border-indigo-400' : 'border-gray-200 bg-white hover:border-[#232999]'}`}
          >
            <i className={`${TYPE_ICON[resource.type]} text-2xl flex-shrink-0 ${darkMode ? 'text-indigo-400' : 'text-[#232999]'}`}></i>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{resource.title[currentLang]}</p>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{resource.description[currentLang]}</p>
            </div>
            <i className={`ri-arrow-down-line flex-shrink-0 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}></i>
          </a>
        ))}
      </div>
    </div>
  );
}
