// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de colores oficial de Evolution Gym
        gym: {
          'negro': '#1C1C1C',    // Fondo y paneles principales
          'rojo': '#D31413',     // Énfasis, alertas y rojo neón
          'gris': '#8B8C8D',     // Textos secundarios y bordes
          'blanco': '#F4F4F4',   // Superficies limpias y texto principal
        },
      },
    },
  },
  plugins: [],
}