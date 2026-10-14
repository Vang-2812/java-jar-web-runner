/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nokia: {
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          screen: '#111827',
          accent: '#10b981',
          key: '#334155',
          keyHover: '#475569'
        }
      }
    },
  },
  plugins: [],
}
