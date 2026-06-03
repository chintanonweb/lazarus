/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        epitaph: ['"Cormorant Garamond"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
        sans: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        grave: {
          night: "#0a0e14",
          fog: "#1a2230",
          stone: "#3a4454",
          moss: "#5b7560",
          bone: "#d8d2c4",
          moon: "#e8e6dd",
          blood: "#9b2c2c",
          ghost: "#7fd4c1",
        },
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "45%": { opacity: "0.86" },
          "47%": { opacity: "0.4" },
          "49%": { opacity: "0.9" },
        },
        drift: {
          "0%": { transform: "translateX(-2%)" },
          "100%": { transform: "translateX(2%)" },
        },
      },
      animation: {
        flicker: "flicker 5s ease-in-out infinite",
        drift: "drift 22s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};
