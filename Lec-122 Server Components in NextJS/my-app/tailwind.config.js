const defaultTheme = require("tailwindcss/defaultTheme");

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
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        panel: {
          0: "rgb(var(--panel-0) / <alpha-value>)",
          1: "rgb(var(--panel-1) / <alpha-value>)",
          2: "rgb(var(--panel-2) / <alpha-value>)",
        },
        ink: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--text-tertiary) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
        },
        line: {
          DEFAULT: "rgb(var(--border) / <alpha-value>)",
          strong: "rgb(var(--border-strong) / <alpha-value>)",
          emphasis: "rgb(var(--border-emphasis) / <alpha-value>)",
        },
        server: {
          DEFAULT: "rgb(var(--server) / <alpha-value>)",
          dim: "rgb(var(--server-dim) / <alpha-value>)",
        },
        client: {
          DEFAULT: "rgb(var(--client) / <alpha-value>)",
          dim: "rgb(var(--client-dim) / <alpha-value>)",
        },
        warn: {
          DEFAULT: "rgb(var(--warn) / <alpha-value>)",
          dim: "rgb(var(--warn-dim) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-mono)", ...defaultTheme.fontFamily.mono],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        none: "none",
      },
    },
  },
  plugins: [],
};
