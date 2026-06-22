// Tailwind 3 + Autoprefixer pipeline. Reemplaza a @astrojs/tailwind (deprecado,
// sin soporte para Astro 6). Astro procesa este postcss.config automáticamente.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
