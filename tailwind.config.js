module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        // 'sans' será Poppins (para texto normal)
        sans: ['Poppins', 'sans-serif'], 
        // Creamos 'heading' para Montserrat (para títulos agresivos)
        heading: ['Montserrat', 'sans-serif'],

        rajdhani: ['Rajdhani', 'sans-serif'],
      },
    },
  },
  plugins: [],
};