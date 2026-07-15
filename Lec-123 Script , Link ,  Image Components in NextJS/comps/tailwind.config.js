/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lab: {
          bg: "#0a0a0c",
          surface: "#111114",
          raised: "#17171b",
          overlay: "#1e1e23",
          border: "rgba(255,255,255,0.08)",
          borderStrong: "rgba(255,255,255,0.16)",
          ink: "rgba(255,255,255,0.94)",
          "ink-soft": "rgba(255,255,255,0.66)",
          "ink-faint": "rgba(255,255,255,0.42)",
          "ink-ghost": "rgba(255,255,255,0.26)",
        },
        link: { DEFAULT: "#5B9CFF", dim: "rgba(91,156,255,0.12)" },
        image: { DEFAULT: "#39D98A", dim: "rgba(57,217,138,0.12)" },
        script: { DEFAULT: "#F5A524", dim: "rgba(245,165,36,0.12)" },
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        mono: ["var(--font-jbmono)"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        dock: "0 -8px 30px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};
