module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  // `public/without_context_api` is a frozen, non-executed BEFORE reference
  // (prop-drilling snapshot for side-by-side comparison in the README) — it
  // is never imported by the running app, so it's excluded from linting
  // rather than edited to satisfy rules that don't apply to a reference copy.
  ignorePatterns: ['dist', '.eslintrc.cjs', 'public/without_context_api'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react/jsx-no-target-blank': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
