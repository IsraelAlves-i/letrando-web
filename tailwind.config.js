/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        letra: {
          navy: "#1B1F3B",
          indigo: "#3D5AFE",
          indigoDark: "#2A3EB1",
          mint: "#00C48C",
          mintDark: "#00A374",
          gold: "#F5B700",
          rose: "#FF6B81",
          lilac: "#B983FF",
          bg: "#F5F3FF",
          ink: "#1E1B2E",
          ink2: "#6B7280",
          border: "#E5E7EB",
        },
      },
      fontFamily: {
        display: ["Poppins", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        tile: "1.25rem",
      },
      boxShadow: {
        card: "0 4px 14px rgba(0, 0, 0, 0.08)",
        cardHover: "0 8px 20px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};