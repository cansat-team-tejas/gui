/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cansat: {
          primary: '#1e40af',
          secondary: '#0ea5e9',
          accent: '#3b82f6',
          dark: '#1e293b',
          light: '#f8fafc'
        }
      }
    },
  },
  plugins: [],
}
