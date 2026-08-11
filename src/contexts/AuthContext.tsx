import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import GoTrue, { User, type Settings } from 'gotrue-js';
import { EMPTY_PROGRESS, withUpdatedBadges, type EspaceProgress } from '../utils/progress';
import { ESPACE_SECTIONS } from '../data/espaceContent';

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
// User.update()/getUserData() (gotrue-js) mutent l'instance existante et
// renvoient CETTE MÊME référence plutôt qu'un objet neuf. Un setUser(updated)
// avec updated === user (même référence) est un no-op pour React (bailout
// sur Object.is) : l'UI ne se re-rendrait pas après un setRole/toggleVideoWatched
// alors que les données ont bien changé. On clone superficiellement (même
// prototype, donc mêmes méthodes .jwt()/.update()/...) pour forcer le re-render.
function cloneUser(u: User): User {
  return Object.create(Object.getPrototypeOf(u), Object.getOwnPropertyDescriptors(u)) as User;
}

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

export type EspaceRole = 'student' | 'parent';

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
  /** Consomme un lien d'invitation (mode Identity "Invite only") : le
   * destinataire choisit son mot de passe et est connecté directement. */
  acceptInvite: (token: string, password: string) => Promise<void>;
  /** null tant que l'utilisateur n'a pas choisi son rôle au premier login. */
  role: EspaceRole | null;
  setRole: (role: EspaceRole) => Promise<void>;
  /** Progression de l'utilisateur courant (pertinent seulement pour role === 'student'). */
  progress: EspaceProgress;
  toggleVideoWatched: (videoId: string) => Promise<void>;
  /** Enregistre un essai de quiz ; ne garde que le meilleur score. */
  submitQuizResult: (sectionKey: string, scoreCount: number, totalQuestions: number) => Promise<void>;
  /** Rattache un compte élève (par code de liaison, voir get-link-code) au
   * compte parent courant, via la fonction serverless link-child (seule
   * capable d'écrire app_metadata). */
  linkChild: (code: string) => Promise<void>;
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

  // setRole/toggleVideoWatched/submitQuizResult/linkChild lisent tous
  // current.user_metadata puis écrivent une version modifiée. Si deux appels
  // se chevauchent (ex: double-clic rapide sur "Marquer comme vue" pour deux
  // vidéos différentes avant que la première requête ne revienne), les deux
  // partent de la même donnée de départ et le second à répondre écrase le
  // premier — une vidéo marquée vue redeviendrait silencieusement non-vue.
  // On sérialise donc ces mutations : chacune ne démarre qu'une fois la
  // précédente terminée (succès ou échec), pour toujours lire l'état à jour.
  const mutationQueueRef = useRef<Promise<unknown>>(Promise.resolve());
  const enqueueMutation = useCallback(<T,>(fn: () => Promise<T>): Promise<T> => {
    const run = mutationQueueRef.current.then(fn, fn);
    mutationQueueRef.current = run.then(() => undefined, () => undefined);
    return run;
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

  // Passe aussi par la file d'attente : sans ça, une mutation de progression
  // lancée juste avant un clic sur "Se déconnecter" pourrait se terminer
  // APRÈS le logout et rappeler setUser(...) avec un utilisateur non-nul,
  // ramenant visuellement l'UI en état connecté juste après la déconnexion.
  const logOut = useCallback(() => enqueueMutation(async () => {
    if (auth.currentUser()) {
      try { await auth.currentUser()!.logout(); } catch { /* on efface l'état local dans tous les cas */ }
    }
    setUser(null);
  }), [enqueueMutation]);

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

  const acceptInvite = useCallback(async (token: string, password: string) => {
    try {
      const invitedUser = await auth.acceptInvite(token, password, true);
      setUser(invitedUser);
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  }, []);

  // Rôle et progression sont stockés dans user_metadata (auto-écrit par
  // l'utilisateur via User.update({ data: {...} }), fusionné côté serveur
  // GoTrue avec les clés existantes). Pas de service supplémentaire : voir
  // l'explication complète donnée à l'utilisateur, résumée dans le commit.
  const role = (user?.user_metadata?.role as EspaceRole | undefined) ?? null;

  const progress = useMemo<EspaceProgress>(() => {
    const raw = user?.user_metadata?.progress as Partial<EspaceProgress> | undefined;
    if (!raw || !Array.isArray(raw.watched)) return EMPTY_PROGRESS;
    return {
      watched: raw.watched,
      lastWatchedVideoId: raw.lastWatchedVideoId,
      lastActivityAt: raw.lastActivityAt,
      quizzes: raw.quizzes,
      badges: raw.badges,
    };
  }, [user]);

  const setRole = useCallback((newRole: EspaceRole) => enqueueMutation(async () => {
    const current = auth.currentUser();
    if (!current) throw new Error('not_authenticated');
    try {
      const updated = await current.update({ data: { ...current.user_metadata, role: newRole } });
      setUser(cloneUser(updated));
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  }), [enqueueMutation]);

  const toggleVideoWatched = useCallback((videoId: string) => enqueueMutation(async () => {
    const current = auth.currentUser();
    if (!current) throw new Error('not_authenticated');
    const raw = current.user_metadata?.progress as Partial<EspaceProgress> | undefined;
    const watched = Array.isArray(raw?.watched) ? raw!.watched as string[] : [];
    const nextWatched = watched.includes(videoId) ? watched.filter(id => id !== videoId) : [...watched, videoId];
    const nextProgress = withUpdatedBadges(ESPACE_SECTIONS, {
      watched: nextWatched,
      lastWatchedVideoId: videoId,
      lastActivityAt: new Date().toISOString(),
      quizzes: raw?.quizzes,
      badges: raw?.badges,
    });
    try {
      const updated = await current.update({ data: { ...current.user_metadata, progress: nextProgress } });
      setUser(cloneUser(updated));
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  }), [enqueueMutation]);

  const submitQuizResult = useCallback((sectionKey: string, scoreCount: number, totalQuestions: number) => enqueueMutation(async () => {
    const current = auth.currentUser();
    if (!current) throw new Error('not_authenticated');
    const raw = current.user_metadata?.progress as Partial<EspaceProgress> | undefined;
    const previousBest = raw?.quizzes?.[sectionKey]?.bestScoreCount ?? -1;
    const nextQuizzes = {
      ...raw?.quizzes,
      [sectionKey]: {
        bestScoreCount: Math.max(previousBest, scoreCount),
        totalQuestions,
        lastAttemptAt: new Date().toISOString(),
      },
    };
    const nextProgress = withUpdatedBadges(ESPACE_SECTIONS, {
      watched: Array.isArray(raw?.watched) ? raw!.watched as string[] : [],
      lastWatchedVideoId: raw?.lastWatchedVideoId,
      lastActivityAt: new Date().toISOString(),
      quizzes: nextQuizzes,
      badges: raw?.badges,
    });
    try {
      const updated = await current.update({ data: { ...current.user_metadata, progress: nextProgress } });
      setUser(cloneUser(updated));
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  }), [enqueueMutation]);

  const linkChild = useCallback((code: string) => enqueueMutation(async () => {
    const current = auth.currentUser();
    if (!current) throw new Error('not_authenticated');
    try {
      const token = await current.jwt();
      const res = await fetch('/.netlify/functions/link-child', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}) as { error?: string });
        throw new Error(body.error || 'link_failed');
      }
      // app_metadata.linkedChildren a été écrit côté serveur : on recharge
      // l'utilisateur pour que le reste de l'app voie le nouveau lien.
      const refreshed = await current.getUserData();
      setUser(cloneUser(refreshed));
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  }), [enqueueMutation]);

  const value = useMemo<AuthContextValue>(() => ({
    user, loading, settings, signUp, logIn, logOut, requestPasswordRecovery, confirmPasswordRecovery, confirmSignup, acceptInvite,
    role, setRole, progress, toggleVideoWatched, submitQuizResult, linkChild,
  }), [user, loading, settings, signUp, logIn, logOut, requestPasswordRecovery, confirmPasswordRecovery, confirmSignup, acceptInvite,
    role, setRole, progress, toggleVideoWatched, submitQuizResult, linkChild]);

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
