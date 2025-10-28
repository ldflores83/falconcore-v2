/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ahau-gold': '#FFC857',
        'ahau-blue': '#1E3D58',
        'ahau-coral': '#FF6B6B',
        'ahau-dark': '#0A0A0A',
        'ahau-light': '#F8F9FA',
      },
      fontFamily: {
        'sans': ['Inter', 'Nunito', 'Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'maya-pattern': "url('/maya-pattern.svg')",
        'hero-gradient': 'linear-gradient(135deg, #1E3D58 0%, #0A0A0A 100%)',
      },
    },
  },
  plugins: [],
}
