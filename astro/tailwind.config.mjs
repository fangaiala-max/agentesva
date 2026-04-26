/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  // Safelist forces compilation of v2 design tokens used inside template literals
  // (some legacy pages from Batch 1+3 use `const bodyHtml = ` template literal pattern
  // which Tailwind's static analyzer doesn't reliably extract from)
  safelist: [
    // Tokens v2 — enumeración explícita para evitar bloat (extraído de template literals)
    'bg-card', 'bg-paper', 'bg-paper-2', 'bg-paper-3',
    'bg-ink', 'bg-ink/5', 'bg-ink/10', 'bg-ink/20',
    'bg-clay', 'bg-clay-deep', 'bg-clay-soft', 'bg-clay-wash', 'bg-clay-wash/10',
    'bg-forest', 'bg-forest-soft', 'bg-forest-wash',
    'bg-sand', 'bg-sand-wash',
    'bg-paper-2/30',
    'text-ink', 'text-ink-2', 'text-ink-3', 'text-ink-4', 'text-ink-3/60',
    'text-paper', 'text-paper/40', 'text-paper/50', 'text-paper/60', 'text-paper/70', 'text-paper/75', 'text-paper/80', 'text-paper/90',
    'text-clay', 'text-clay-deep', 'text-clay-soft',
    'text-forest', 'text-sand',
    'text-line-soft/10',
    'border-ink', 'border-ink/20',
    'border-clay', 'border-clay/10', 'border-clay/30',
    'border-line', 'border-line-soft', 'border-line-soft/10', 'border-line-soft/15', 'border-line-soft/20', 'border-line-soft/30',
    'from-ink', 'from-ink/20', 'from-clay', 'from-clay-deep', 'from-clay-wash',
    'to-clay', 'to-clay-deep', 'to-clay-wash',
    // Hovers v2
    'hover:bg-ink/5', 'hover:bg-paper-2', 'hover:text-ink', 'hover:text-clay',
    // Selection
    'selection:bg-clay-wash', 'selection:text-clay-deep',
    // Tipografía
    'font-serif', 'font-sans', 'font-mono',
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#F7F3EC',
          2: '#EFE8DC',
          3: '#E5DCC8',
        },
        ink: {
          DEFAULT: '#1A1814',
          2: '#3D362C',
          3: '#6B6253',
          4: '#9A8F7C',
        },
        line: {
          DEFAULT: '#D9CFB8',
          soft: '#E8DFCC',
        },
        card: '#FFFEFB',
        clay: {
          DEFAULT: '#C2543A',
          deep: '#9C3F2A',
          soft: '#E8B5A4',
          wash: '#F4DDD2',
        },
        forest: {
          DEFAULT: '#2F4A3A',
          soft: '#5C7868',
          wash: '#DFE7E0',
        },
        sand: {
          DEFAULT: '#E8C77E',
          wash: '#F5E9CC',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Inter Tight"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', '"SF Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        'sh-sm': '0 1px 2px rgba(26, 24, 20, 0.06)',
        'sh-md': '0 4px 16px rgba(26, 24, 20, 0.06), 0 1px 3px rgba(26, 24, 20, 0.04)',
        'sh-lg': '0 12px 32px rgba(26, 24, 20, 0.08), 0 2px 6px rgba(26, 24, 20, 0.04)',
      },
      maxWidth: {
        page: '1240px',
      },
    },
  },
  plugins: [],
};
