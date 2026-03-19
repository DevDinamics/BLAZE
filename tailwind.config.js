/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss,css}",
    "./src/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], 
        heading: ['Montserrat', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
    },
  },
  plugins: [],
};