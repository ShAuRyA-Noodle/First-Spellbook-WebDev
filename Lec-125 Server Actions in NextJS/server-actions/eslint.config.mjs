import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

// Next.js 16 dropped the built-in `next lint` command, so ESLint runs
// standalone (`npm run lint` → `eslint .`) against this flat config.
// eslint-config-next 16 ships a native flat-config export, so no
// FlatCompat/legacy bridge is needed.
const eslintConfig = [...nextCoreWebVitals];

export default eslintConfig;
