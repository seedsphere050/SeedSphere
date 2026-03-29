/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // This maps to your 'font-serif' class
        'playfair': ['"Playfair Display"', 'serif'],
        // This maps to your 'font-signature' class
        signature: ['"Mrs Saint Delafield"', 'cursive'],
      },
    },
  },
  plugins: [],
}