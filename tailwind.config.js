/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lime: '#c6ff85',
        darklime:'#94C748'
      },
      fontFamily: {
        quicksand: ['Quicksand', 'sans-serif'],
      },
    },
  },
  plugins: [],
};