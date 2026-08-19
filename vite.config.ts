import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "node:path";
import AutoImport from "unplugin-auto-import/vite";

const base = process.env.BASE_PATH || "/";
const isPreview = process.env.IS_PREVIEW ? true : false;
// https://vite.dev/config/
export default defineConfig({
  define: {
    __BASE_PATH__: JSON.stringify(base),
    __IS_PREVIEW__: JSON.stringify(isPreview),  },
  plugins: [
    react(),
    AutoImport({
      imports: [
        {
          react: [
            "React",
            "useState",
            "useEffect",
            "useContext",
            "useReducer",
            "useCallback",
            "useMemo",
            "useRef",
            "useImperativeHandle",
            "useLayoutEffect",
            "useDebugValue",
            "useDeferredValue",
            "useId",
            "useInsertionEffect",
            "useSyncExternalStore",
            "useTransition",
            "startTransition",
            "lazy",
            "memo",
            "forwardRef",
            "createContext",
            "createElement",
            "cloneElement",
            "isValidElement",
          ],
        },
        {
          "react-router-dom": [
            "useNavigate",
            "useLocation",
            "useParams",
            "useSearchParams",
            "Link",
            "NavLink",
            "Navigate",
            "Outlet",
          ],
        },
        // React i18n
        {
          "react-i18next": ["useTranslation", "Trans"],
        },
      ],
      dts: true,
    }),
  ],
  base,
  build: {
    sourcemap: false,
    outDir: "out",
    rollupOptions: {
      output: {
        // Sépare React/ReactDOM/React Router (change rarement) du reste du
        // chunk d'entrée (App.tsx, router config — change à chaque déploiement
        // touchant une page). Ne réduit pas le poids du tout premier
        // chargement (mêmes octets au total, juste dans 2 fichiers au lieu
        // d'un), mais un visiteur qui revient après un déploiement qui n'a
        // pas touché React lui-même garde ce chunk en cache navigateur au
        // lieu de le retélécharger avec le reste. gotrue-js, Stripe et
        // marked sont déjà isolés à leurs pages respectives (Mon espace,
        // checkout, blog) — vérifié, rien à en sortir ici.
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
});
