/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        onyx: {
          950: '#07090e',
          900: '#0c1017',
          800: '#131924',
          700: '#1e293b',
        },
      },
    },
  },
  plugins: [],
};