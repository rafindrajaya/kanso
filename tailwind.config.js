/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: {
          light: '#FBFBFA',
          card: '#FFFFFF',
          dark: '#191919',
          darkCard: '#202020',
          darkHover: '#2A2A2A',
        },
        ink: {
          primary: '#37352F',
          secondary: '#787774',
          darkPrimary: '#EDEDEB',
          darkSecondary: '#9B9A97',
        },
        notion: {
          blue: '#2383E2',
          red: '#EB5757',
          green: '#27AE60',
          yellow: '#DFAB01',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Inter',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
