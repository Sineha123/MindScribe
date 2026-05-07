/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#040B16',
        surface: 'rgba(13, 25, 48, 0.6)',
        surfaceBorder: 'rgba(56, 189, 248, 0.2)',
        primary: '#38bdf8',
        secondary: '#818cf8',
        accent: '#c084fc',
        textMain: '#f8fafc',
        textMuted: '#94a3b8',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 15px 0 rgba(56, 189, 248, 0.5)' },
          '50%': { opacity: .7, boxShadow: '0 0 25px 0 rgba(56, 189, 248, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
