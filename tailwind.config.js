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
        comic: {
          bg: '#F7F5F0',          // Broken white / textured canvas
          card: '#FDFCF9',        // Off-white panel
          cardDark: '#171717',    // Charcoal dark mode
          ink: '#0F0F0F',         // Solid comic ink black
          inkMuted: '#6B6862',    // Comic secondary line
          green: '#1B3E22',       // Frog wizard dark green
          greenLight: '#E8EFEA',  // Soft wizard green highlight
          greenDark: '#2E5A37',   // Lighter wizard green for dark mode
        },
      },
      boxShadow: {
        'comic': '2px 2px 0px 0px #0F0F0F',
        'comic-sm': '1px 1px 0px 0px #0F0F0F',
        'comic-lg': '3px 3px 0px 0px #0F0F0F',
        'comic-dark': '2px 2px 0px 0px #EDEDEB',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          '"SF Mono"',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
}
