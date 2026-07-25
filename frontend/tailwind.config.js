/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nta: {
          blue: {
            light: '#eef2ff',
            DEFAULT: '#1e40af',
            dark: '#1e3a8a',
            accent: '#3b82f6',
          },
          green: {
            DEFAULT: '#22c55e',
            dark: '#15803d',
          },
          red: {
            DEFAULT: '#ef4444',
            dark: '#b91c1c',
          },
          purple: {
            DEFAULT: '#a855f7',
            dark: '#7e22ce',
          },
          grey: {
            DEFAULT: '#6b7280',
            light: '#f3f4f6',
          }
        }
      }
    },
  },
  plugins: [],
}
