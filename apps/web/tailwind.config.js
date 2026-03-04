/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        violet: {
          600: '#7c3aed',
        },
      },
    },
  },
  plugins: [],
}
