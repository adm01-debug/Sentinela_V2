// Flat config (ESLint 9+). Tradução direta do .eslintrc.json anterior:
// mesmos plugins, mesmas regras, mesmos overrides — nada foi afrouxado nem endurecido aqui.
import js from '@eslint/js';
import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist/**', 'build/**', 'coverage/**', 'node_modules/**', '**/*.min.js', '**/*.min.css'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.es2022,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      // Regras do .eslintrc.json original
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'import/order': [
        'error',
        { groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'] },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // no-undef é ruído em TypeScript: o compilador já cobre isso, e a regra
      // não conhece os tipos globais do TS. Recomendação oficial do typescript-eslint.
      'no-undef': 'off',
    },
  },
  prettier,
];
