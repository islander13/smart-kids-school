import { useNavigate, type NavigateFunction } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import { useEffect, useState } from "react";
import routes from "./config";

let navigateResolver: (navigate: ReturnType<typeof useNavigate>) => void;

declare global {
  interface Window {
    REACT_APP_NAVIGATE: ReturnType<typeof useNavigate>;
  }
}

export const navigatePromise = new Promise<NavigateFunction>((resolve) => {
  navigateResolver = resolve;
});

// Les emails Netlify Identity (récupération de mot de passe, confirmation
// d'inscription, invitation) pointent par défaut vers la racine du site avec
// un token dans le hash (#recovery_token=..., #confirmation_token=...,
// #invite_token=...) — pas vers /espace, seule page équipée pour les
// traiter. Détecté avant le premier rendu de route pour rediriger sans
// laisser apparaître la page d'accueil au passage.
function hasIdentityHashToken(): boolean {
  return /(recovery_token|confirmation_token|invite_token)=/.test(window.location.hash);
}

function isEspacePath(pathname: string): boolean {
  return /^\/(en\/|de\/)?espace(\/|$)/.test(pathname);
}

export function AppRoutes() {
  const navigate = useNavigate();
  const [redirectingToEspace, setRedirectingToEspace] = useState(
    () => hasIdentityHashToken() && !isEspacePath(window.location.pathname)
  );

  useEffect(() => {
    if (!redirectingToEspace) return;
    navigate({ pathname: "/espace", hash: window.location.hash }, { replace: true });
    setRedirectingToEspace(false);
  }, [redirectingToEspace, navigate]);

  const element = useRoutes(routes);

  useEffect(() => {
    window.REACT_APP_NAVIGATE = navigate;
    navigateResolver(window.REACT_APP_NAVIGATE);
  });

  if (redirectingToEspace) return null;

  return element;
}
