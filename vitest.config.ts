import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

// Config séparée de vite.config.ts : les tests couvrent aussi bien du code
// frontend pur (src/utils/progress.ts) que des fonctions Netlify CommonJS
// (netlify/functions/lib/*.js) — pas besoin des plugins React/auto-import du
// build principal ici, juste la résolution du même alias "@".
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.{js,ts}"],
  },
});
