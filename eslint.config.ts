import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default [
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      // Pattern volontaire dans tout le site : `try { ... } catch {}` pour les
      // accès localStorage non critiques (le site doit fonctionner même si
      // localStorage est indisponible, ex: navigation privée).
      'no-empty': ['error', { allowEmptyCatch: true }],
      // Pattern volontaire : `{false && (<section>...)}` pour désactiver une
      // section sans supprimer son code (ex: partenariat non confirmé,
      // teaser Premium en attente) — voir les commentaires à chaque usage.
      'no-constant-binary-expression': 'off',
    },
  },
]

