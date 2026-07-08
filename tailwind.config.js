/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: 'var(--color-ink)',
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        accent: 'var(--color-accent)',
        'accent-ink': 'var(--color-accent-ink)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        'muted-text': 'var(--color-muted-text)',
        text: 'var(--color-ink)',
        brand: {
          500: 'var(--color-accent)',
          600: 'var(--color-accent)',
          DEFAULT: 'var(--color-accent)',
        },
      },
      borderRadius: {
        card: '8px',
        input: '8px',
        badge: '4px',
      },
      boxShadow: {
        'flat-border': '0 0 0 1px var(--color-border)',
      },
    },
  },
  plugins: [],
}
