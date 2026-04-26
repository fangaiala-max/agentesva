/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  // Safelist forces compilation of v2 design tokens used inside template literals
  // (some legacy pages from Batch 1+3 use `const bodyHtml = ` template literal pattern
  // which Tailwind's static analyzer doesn't reliably extract from)
  safelist: [
    // v2 design tokens — broad patterns to catch all token-color combinations
    { pattern: /(bg|text|border|from|to|via|placeholder|ring|outline|divide|fill)-(paper|ink|clay|forest|sand|line|card)/, variants: ['hover', 'focus', 'active', 'group-hover', 'md', 'lg'] },
    { pattern: /(bg|text|border|from|to)-(paper|ink|clay|forest|sand|line)-(2|3|4|deep|soft|wash)/, variants: ['hover', 'focus', 'group-hover', 'md', 'lg'] },
    // Tipografía v2
    'font-serif', 'font-sans', 'font-mono',
    // Selection variants
    'selection:bg-clay-wash', 'selection:text-clay-deep', 'selection:bg-paper', 'selection:text-ink',
    // Common opacity modifiers
    { pattern: /(bg|text|border)-(paper|ink|clay|forest|sand|line|card)\/(\d{1,3})/, variants: ['hover', 'group-hover'] },
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
