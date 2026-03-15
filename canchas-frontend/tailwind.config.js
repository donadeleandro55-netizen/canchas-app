/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        cy: {
          green: '#16a34a',
          'green-light': '#22c55e',
          'green-dark': '#15803d',
          black: '#0a0a0a',
          gray: '#171717',
          gray2: '#262626',
          gray3: '#404040',
          white: '#fafafa',
          muted: '#a3a3a3',
        }
      }
    },
  },
  plugins: [],
}