import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { RouteObject } from "react-router-dom";
import { BASE_PATHS, FORM_DEEPLINK_PATHS, localizedPath, LOCALES } from "../i18n/routing";

const NotFound = lazy(() => import("../pages/notfound"));
const Home = lazy(() => import("../pages/home"));
const LegalNotice = lazy(() => import("../pages/legal"));
const CGV = lazy(() => import("../pages/cgv"));
const Tarifs = lazy(() => import("../pages/tarifs"));
const Stages = lazy(() => import("../pages/stages"));
const FAQ = lazy(() => import("../pages/faq"));
const Merci = lazy(() => import("../pages/merci"));
const Premium = lazy(() => import("../pages/premium"));

// Chaque page indexable (BASE_PATHS) est montée sous 3 URLs : française (sans
// préfixe), /en/... et /de/.... Les 3 rendent le même composant, qui détecte
// la langue depuis l'URL elle-même (voir src/i18n/routing.ts).
const componentByBasePath: Record<(typeof BASE_PATHS)[number], LazyExoticComponent<ComponentType>> = {
  "/": Home,
  "/tarifs": Tarifs,
  "/stages": Stages,
  "/premium": Premium,
  "/faq": FAQ,
  "/merci": Merci,
  "/legal": LegalNotice,
  "/cgv": CGV,
};

const localizedRoutes: RouteObject[] = BASE_PATHS.flatMap((basePath) => {
  const Component = componentByBasePath[basePath];
  return LOCALES.map((locale) => ({
    path: localizedPath(basePath, locale),
    element: <Component />,
  }));
});

// Liens directs vers un formulaire (ex: /tarifs/inscription) : même composant
// que la page parente, qui détecte le suffixe "/inscription" pour ouvrir sa
// modal automatiquement (voir chaque page, useEffect "deep link formulaire").
const formDeeplinkRoutes: RouteObject[] = FORM_DEEPLINK_PATHS.flatMap((deepPath) => {
  const basePath = `/${deepPath.split("/")[1]}` as (typeof BASE_PATHS)[number];
  const Component = componentByBasePath[basePath];
  return LOCALES.map((locale) => ({
    path: localizedPath(deepPath, locale),
    element: <Component />,
  }));
});

const routes: RouteObject[] = [
  ...localizedRoutes,
  ...formDeeplinkRoutes,
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;