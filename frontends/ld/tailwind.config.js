/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ld-primary': '#1e40af',
        'ld-secondary': '#7c3aed',
        'ld-accent': '#f59e0b',
        'ld-success': '#10b981',
        'ld-warning': '#f59e0b',
        'ld-error': '#ef4444',
        'ld-dark': '#1f2937',
        'ld-light': '#f9fafb'
      }
    },
  },
  plugins: [],
}
