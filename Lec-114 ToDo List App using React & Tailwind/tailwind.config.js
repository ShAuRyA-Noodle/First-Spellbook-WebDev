/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Surfaces: a warm, low-lit "desk at dusk" canvas ──
           Each step is only a few points lighter than the last —
           enough to read as "elevated" without ever shouting. */
        surface: {
          0: '#161310',      // page canvas
          1: '#1e1a15',      // panel / card
          2: '#27221b',      // hover state / popover elevation
          inset: '#100d0a',  // inputs — sit a touch below their surroundings
        },
        /* ── Text hierarchy: warm paper-white, stepped down by opacity ── */
        ink: {
          primary: '#f6f0e4',
          secondary: 'rgb(246 240 228 / 0.66)',
          tertiary: 'rgb(246 240 228 / 0.44)',
          muted: 'rgb(246 240 228 / 0.28)',
        },
        /* ── Borders: quiet by default, only opinionated when it matters ── */
        line: {
          subtle: 'rgb(246 240 228 / 0.06)',
          DEFAULT: 'rgb(246 240 228 / 0.10)',
          strong: 'rgb(246 240 228 / 0.18)',
        },
        /* ── Brand: a single accent, the brass fitting on a leather planner ── */
        accent: {
          DEFAULT: '#dd9a3d',
          hover: '#eaac54',
          subtle: 'rgb(221 154 61 / 0.14)',
        },
        /* ── Semantic: used only for what they mean, nowhere else ── */
        success: {
          DEFAULT: '#87a373',
          subtle: 'rgb(135 163 115 / 0.16)',
        },
        destructive: {
          DEFAULT: '#d97361',
          subtle: 'rgb(217 115 97 / 0.14)',
        },
      },
      boxShadow: {
        panel: '0 1px 2px rgb(0 0 0 / 0.2), 0 16px 40px -12px rgb(0 0 0 / 0.45)',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-4px)' },
          '40%': { transform: 'translateX(4px)' },
          '60%': { transform: 'translateX(-3px)' },
          '80%': { transform: 'translateX(3px)' },
        },
      },
      animation: {
        shake: 'shake 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
}
