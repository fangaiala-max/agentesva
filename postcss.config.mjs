// Tailwind 4 (@tailwindcss/postcss). Astro procesa este postcss.config
// automáticamente. TW4 usa Lightning CSS, que prefija toda la hoja (utilidades
// + CSS custom del tema) según browserslist — autoprefixer ya no hace falta.
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
