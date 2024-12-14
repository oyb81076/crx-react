import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  stylistic.configs.customize({
    indent: 2, quotes: 'single', semi: true, jsx: true, arrowParens: true,
  }),
  {
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': ['error', { groups: [
        ['^node:', '^react$', '^react-dom$', '^react-router-dom$', '^@?\\w'],
        ['^[~]'],
        ['^\\.'],
      ] }],
    },
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx,cts}'],
    languageOptions: { ecmaVersion: 2020, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['**/*.{ts,tsx,cts}'],
    rules: {
      '@stylistic/jsx-one-expression-per-line': 0,
      '@stylistic/max-statements-per-line': ['error', { max: 2 }],
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'eqeqeq': ['error', 'smart'],
    },
  },
);
