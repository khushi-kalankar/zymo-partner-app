/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
        
        colors: {
          lime: "#e9ff81",
          darklime: "#bed459",
        },
        fontFamily: {
          quicksand: ["Quicksand", "sans-serif"],
          montserrat: ['Montserrat', 'sans-serif'],
        },
        animation: {
          'slide-in': 'slideIn 1s ease-in-out forwards',
        },
        keyframes: {
          slideIn: {
            '0%': {
              transform: 'translateY(50px)',
              opacity: '0',
            },
            '100%': {
              transform: 'translateY(0)',
              opacity: '1',
            },
          },
      },
      boxShadow: {
        'custom-even': '0 0px 10px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
