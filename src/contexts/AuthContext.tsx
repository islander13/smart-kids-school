import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import GoTrue, { User, type Settings } from 'gotrue-js';

// ─────────────────────────────────────────────────────────────────────────
// Authentification "Mon espace" via Netlify Identity (GoTrue), pas de gestion
// de mots de passe maison. Nécessite qu'Identity soit activé côté dashboard
// Netlify (Site settings → Identity → Enable Identity) — sans ça, les appels
// ci-dessous échouent avec une erreur claire, gérée normalement.
//
// APIUrl déduite de l'origine courante (window.location.origin) plutôt que
// codée en dur : fonctionne pareil en production, sur les deploy previews et
// les branch deploys Netlify, sans configuration par environnement.
// ─────────────────────────────────────────────────────────────────────────

const auth = new GoTrue({
  APIUrl: `${window.location.origin}/.netlify/identity`,
  setCookie: false, // session gérée en localStorage par gotrue-js, pas besoin de cookie côté serveur ici
});

// Extrait un message d'erreur lisible depuis les erreurs GoTrue (HTTP/JSON)
// ou toute autre exception, sans jamais laisser passer une erreur brute non
// traduite à l'écran.
function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const withJson = err as { json?: { error_description?: string; msg?: string; error?: string } };
    if (withJson.json?.error_description) return withJson.json.error_description;
    if (withJson.json?.msg) return withJson.json.msg;
    if (withJson.json?.error) return withJson.json.error;
  }
  if (err instanceof Error) return err.message;
  return 'unknown_error';
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** null tant que non chargé ; permet d'adapter l'UI (ex: inscriptions désactivées). */
  settings: Settings | null;
  signUp: (email: string, password: string) => Promise<{ needsConfirmation: boolean }>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  requestPasswordRecovery: (email: string) => Promise<void>;
  confirmPasswordRecovery: (token: string, newPassword: string) => Promise<void>;
  confirmSignup: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => auth.currentUser());
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    // Restaure la session depuis le stockage local (rapide), puis la valide
    // en tâche de fond (rafraîchit le token si besoin, déconnecte si le
    // token n'est plus valide côté serveur).
    let cancelled = false;
    auth.validateCurrentSession()
      .then((validUser) => { if (!cancelled) setUser(validUser); })
      .catch(() => { if (!cancelled) setUser(null); })
      .finally(() => { if (!cancelled) setLoading(false); });

    auth.settings()
      .then((s) => { if (!cancelled) setSettings(s); })
      .catch(() => { /* non bloquant : l'UI reste utilisable sans ces réglages */ });

    return () => { cancelled = true; };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      await auth.signup(email, password);
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
    // signup() ne connecte pas automatiquement : si la confirmation par email
    // est requise (autoconfirm désactivé côté Identity), l'utilisateur doit
    // cliquer le lien reçu avant de pouvoir se connecter. On tente une
    // connexion immédiate ; si elle échoue pour cette raison précise, on le
    // signale proprement plutôt que de faire échouer l'inscription.
    try {
      const loggedInUser = await auth.login(email, password, true);
      setUser(loggedInUser);
      return { needsConfirmation: false };
    } catch {
      return { needsConfirmation: true };
    }
  }, []);

  const logIn = useCallback(async (email: string, password: string) => {
    try {
      const loggedInUser = await auth.login(email, password, true);
      setUser(loggedInUser);
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  }, []);

  const logOut = useCallback(async () => {
    if (auth.currentUser()) {
      try { await auth.currentUser()!.logout(); } catch { /* on efface l'état local dans tous les cas */ }
    }
    setUser(null);
  }, []);

  const requestPasswordRecovery = useCallback(async (email: string) => {
    try {
      await auth.requestPasswordRecovery(email);
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  }, []);

  const confirmPasswordRecovery = useCallback(async (token: string, newPassword: string) => {
    try {
      const recoveredUser = await auth.recover(token, true);
      const updatedUser = await recoveredUser.update({ password: newPassword });
      setUser(updatedUser);
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  }, []);

  const confirmSignup = useCallback(async (token: string) => {
    try {
      const confirmedUser = await auth.confirm(token, true);
      setUser(confirmedUser);
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user, loading, settings, signUp, logIn, logOut, requestPasswordRecovery, confirmPasswordRecovery, confirmSignup,
  }), [user, loading, settings, signUp, logIn, logOut, requestPasswordRecovery, confirmPasswordRecovery, confirmSignup]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Colocation volontaire du hook avec le provider (pattern React de contexte
// standard) : casse le fast-refresh granulaire sur ce fichier, sans impact
// fonctionnel.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth() must be used within <AuthProvider>');
  return ctx;
}
