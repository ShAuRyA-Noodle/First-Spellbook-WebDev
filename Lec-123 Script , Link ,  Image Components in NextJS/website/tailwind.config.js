/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FAF6F0",
        "paper-dim": "#F1EAE0",
        ink: {
          DEFAULT: "#221D18",
          soft: "rgba(34,29,24,0.66)",
          faint: "rgba(34,29,24,0.46)",
          ghost: "rgba(34,29,24,0.14)",
        },
        clay: { DEFAULT: "#B15A34", dark: "#8F4726", light: "#E7C7B4" },
      },
      fontFamily: {
        serif: ["var(--font-fraunces)"],
        sans: ["var(--font-worksans)"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      letterSpacing: {
        wideish: "0.08em",
      },
    },
  },
  plugins: [],
};
