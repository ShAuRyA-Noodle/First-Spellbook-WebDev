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
        canvas: "var(--bg)",
        surface: {
          1: "var(--surface-1)",
          2: "var(--surface-2)",
          inset: "var(--surface-inset)",
        },
        line: {
          subtle: "var(--border-subtle)",
          DEFAULT: "var(--border-default)",
          strong: "var(--border-strong)",
        },
        ink: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          muted: "var(--text-muted)",
        },
        signal: {
          DEFAULT: "var(--accent)",
          strong: "var(--accent-strong)",
          dim: "var(--accent-dim)",
        },
        proof: {
          DEFAULT: "var(--success)",
          dim: "var(--success-dim)",
        },
        transit: {
          DEFAULT: "var(--pending)",
          dim: "var(--pending-dim)",
        },
        fault: {
          DEFAULT: "var(--danger)",
          dim: "var(--danger-dim)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
