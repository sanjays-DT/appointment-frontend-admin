/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',    // all files inside the app folder
    './components/**/*.{js,ts,jsx,tsx}', // all files inside components folder
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF',  // example custom color
        secondary: '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
