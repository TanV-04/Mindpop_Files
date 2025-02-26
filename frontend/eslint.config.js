import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { 
      react: { 
        version: '18.3',
        // Enable automatic detection of required props
        propWrapperFunctions: ['forbidExtraProps', 'exact', 'Object.freeze'],
      } 
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Add specific rules for prop validation
      'no-unused-vars': 'off',
      // or to be more specific
      '@typescript-eslint/no-unused-vars': 'off',
      'react/prop-types': ['error', { skipUndeclared: true }],
      'react/require-default-props': 'warn',
      'react/default-props-match-prop-types': 'warn',
      // Turn off temporarily if getting too many errors
      'react/no-unused-prop-types': 'warn',
    },
  },
]