/** @type {import('tailwindcss').Config} */
export default {
  // Content globs: every source file that can contain utility class names.
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}', './tools/**/*.mjs'],
  theme: {
    extend: {
      fontFamily: {
        // Matches the self-hosted variable font declared in src/index.css.
        sans: ['Inter Variable', 'system-ui', '-apple-system', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite'
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.08)' }
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(6px)' }
        }
      }
    }
  },
  // components/ui/Grid.tsx composes class names at runtime (`grid-cols-${n}` /
  // `md:grid-cols-${n}`), so the scanner can never see them as literals.
  safelist: [
    { pattern: /^grid-cols-[1-6]$/ },
    { pattern: /^grid-cols-[1-6]$/, variants: ['sm', 'md', 'lg', 'xl', '2xl'] }
  ],
  plugins: []
}
