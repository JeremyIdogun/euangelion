/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FAF6F0',
        primary: '#8B4513',
        accent: '#C17B3F',
        'text-main': '#2C1A0E',
        muted: '#A0856B',
        'card-bg': '#FFF8F0',
      },
      fontFamily: {
        sans: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        ui: ['system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px rgba(44,26,14,0.08)',
        card: '0 4px 20px rgba(44,26,14,0.10)',
      },
    },
  },
  plugins: [],
};
