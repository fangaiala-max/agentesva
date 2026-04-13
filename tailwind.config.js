/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./*.html",
    "./catalogo/**/*.html",
    "./precios/**/*.html",
    "./servicios/**/*.html",
    "./faq/**/*.html",
    "./legal/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        "secondary-container": "#d7dbfd",
        "on-secondary-container": "#5b5f7c",
        "on-surface-variant": "#444656",
        "error-container": "#ffdad6",
        "outline-variant": "#c4c5d9",
        "on-tertiary": "#ffffff",
        "surface": "#fbf8ff",
        "outline": "#747688",
        "surface-container-highest": "#dee1ff",
        "error": "#ba1a1a",
        "background": "#fbf8ff",
        "surface-container-low": "#f3f2ff",
        "surface-dim": "#d4d8fa",
        "surface-container": "#ececff",
        "tertiary-fixed-dim": "#ffb3b2",
        "tertiary": "#91001e",
        "on-secondary": "#ffffff",
        "on-secondary-fixed-variant": "#404561",
        "on-secondary-fixed": "#151a33",
        "on-background": "#151a33",
        "surface-container-high": "#e5e6ff",
        "surface-tint": "#1f48f1",
        "secondary-fixed-dim": "#c1c4e6",
        "on-primary-fixed": "#00105a",
        "on-tertiary-container": "#ffcbca",
        "surface-variant": "#dee1ff",
        "inverse-on-surface": "#f0efff",
        "tertiary-container": "#be002b",
        "on-primary-container": "#d0d5ff",
        "on-primary-fixed-variant": "#0030c7",
        "secondary-fixed": "#dee1ff",
        "primary-fixed-dim": "#bac3ff",
        "surface-container-lowest": "#ffffff",
        "primary-fixed": "#dee0ff",
        "secondary": "#585d7a",
        "primary": "#0030c6",
        "primary-container": "#1e47f1",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        "on-primary": "#ffffff",
        "surface-bright": "#fbf8ff",
        "tertiary-fixed": "#ffdad9",
        "on-surface": "#151a33",
        "inverse-primary": "#bac3ff",
        "on-tertiary-fixed-variant": "#92001f",
        "inverse-surface": "#2a2f49",
        "on-tertiary-fixed": "#410008"
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
        full: "9999px"
      },
      fontFamily: {
        headline: ["Manrope"],
        body: ["Inter"],
        label: ["Inter"]
      }
    }
  },
  plugins: [
    require("@tailwindcss/forms")
  ]
}
