/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: "#0A2540",
          darknavy: "#061727",
          deepblue: "#1E3A8A",
          accentblue: "#0284C7",
          saffron: "#FF9933",
          gold: "#D97706",
          darkgold: "#B45309",
          emerald: "#047857",
          rose: "#BE123C",
          slate: "#F8FAFC",
          cardbg: "#FFFFFF",
          border: "#CBD5E1"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}
