/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss,css}", // 👈 Agregamos scss y css por si acaso
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