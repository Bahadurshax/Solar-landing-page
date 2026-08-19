import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  /* Build output, and vendored tooling. The skill directories hold third-party
     scripts that are not this project's source and do not answer to its rules;
     linting them buries the handful of findings that are ours under a couple
     of hundred that are not. */
  globalIgnores(['dist', '.claude/skills', '.agents/skills']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])
