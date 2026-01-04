/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'satya-blue': '#1e3a8a',
        'satya-orange': '#f97316',
      }
    },
  },
  plugins: [],
}