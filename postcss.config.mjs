// Tailwind 4 (@tailwindcss/postcss) + Autoprefixer. Astro procesa este
// postcss.config automáticamente. autoprefixer prefija el CSS custom del tema;
// Tailwind 4 auto-prefija su propia salida.
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
