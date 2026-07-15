/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        squid: {
          pink:    '#ff2d78',
          teal:    '#00ffcc',
          dark:    '#0a0a0f',
          card:    '#12121f',
          deep:    '#1a1a2e',
          red:     '#ff1744',
          guard:   '#e91e63',
          dim:     'rgba(240,240,240,0.6)',
        }
      },
      keyframes: {
        floatY: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-22px)' },
        },
        rotateSlow: {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        rotateSlowRev: {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(-360deg)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 12px #ff2d78, 0 0 24px rgba(255,45,120,0.3)' },
          '50%':      { boxShadow: '0 0 24px #ff2d78, 0 0 48px #ff2d78, 0 0 72px rgba(255,45,120,0.4)' },
        },
        scanline: {
          '0%':   { top: '-10%' },
          '100%': { top: '110%' },
        },
        flicker: {
          '0%, 95%, 100%': { opacity: '1' },
          '96%':            { opacity: '0.6' },
          '97%':            { opacity: '1' },
          '98%':            { opacity: '0.4' },
        },
        numberBlink: {
          '0%, 100%': { opacity: '0.7' },
          '50%':       { opacity: '0.2' },
        },
      },
      animation: {
        'float':         'floatY 6s ease-in-out infinite',
        'float-slow':    'floatY 9s ease-in-out infinite',
        'rotate-slow':   'rotateSlow 28s linear infinite',
        'rotate-rev':    'rotateSlowRev 18s linear infinite',
        'glow-pulse':    'glowPulse 2.5s ease-in-out infinite',
        'scanline':      'scanline 4s linear infinite',
        'flicker':       'flicker 8s infinite',
        'num-blink':     'numberBlink 3s ease-in-out infinite',
      },
      backgroundImage: {
        'squid-gradient': 'linear-gradient(135deg, #12121f 0%, #1a1a2e 50%, #0f1a30 100%)',
      },
    },
  },
  plugins: [],
}
