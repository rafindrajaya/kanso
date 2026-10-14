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
          bg: '#F7F5F0',          // Broken white / warm canvas
          bgDark: '#121212',      // Deep dark canvas
          card: '#FDFCF9',        // Off-white panel
          cardDark: '#222222',    // Elevated charcoal card
          ink: '#0F0F0F',         // Solid comic ink black
          inkMuted: '#6B6862',    // Comic secondary line
          green: '#1B3E22',       // Frog wizard dark green
          greenLight: '#E8EFEA',  // Soft wizard green highlight
          greenDark: '#2E5A37',   // Lighter wizard green for dark mode
        },
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
