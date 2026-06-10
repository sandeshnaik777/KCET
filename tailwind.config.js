/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#f0f4f8',
          100: '#d9e6f2',
          200: '#b3cde5',
          300: '#7aaacf',
          400: '#4d88b8',
          500: '#2e6da0',
          600: '#1e5484',
          700: '#163d62',
          800: '#0f2a44',
          900: '#0a1c2e',
          950: '#060f1a',
        },
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        safe:     { DEFAULT: '#16a34a', light: '#dcfce7', dark: '#14532d', border: '#86efac' },
        moderate: { DEFAULT: '#d97706', light: '#fef3c7', dark: '#78350f', border: '#fcd34d' },
        tough:    { DEFAULT: '#dc2626', light: '#fee2e2', dark: '#7f1d1d', border: '#fca5a5' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.35s ease-out',
        'slide-in':   'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideIn: { from: { opacity: 0, transform: 'translateX(-8px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      },
      boxShadow: {
        'card':  '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.1)',
        'sidebar': '2px 0 8px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
