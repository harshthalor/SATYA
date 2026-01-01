/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066cc',
          dark: '#0052a3',
        },
        secondary: {
          DEFAULT: '#00cc66',
          dark: '#00a352',
        },
      },
    },
  },
  plugins: [],
}

