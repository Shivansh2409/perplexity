/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // Light theme colors
        light: {
          bg: "#ffffff",
          bgSecondary: "#f5f5f5",
          text: "#0a0a0a",
          textSecondary: "#666666",
          border: "#e0e0e0",
          hover: "#f0f0f0",
        },
        // Dark theme colors
        dark: {
          bg: "#0a0a0a",
          bgSecondary: "#1a1a1a",
          text: "#ffffff",
          textSecondary: "#a0a0a0",
          border: "#333333",
          hover: "#1f1f1f",
        },
      },
      backgroundColor: {
        // Light mode backgrounds
        "light-primary": "#ffffff",
        "light-secondary": "#f5f5f5",
        "light-tertiary": "#eeeeee",
        // Dark mode backgrounds
        "dark-primary": "#0a0a0a",
        "dark-secondary": "#1a1a1a",
        "dark-tertiary": "#2a2a2a",
      },
      textColor: {
        "light-primary": "#0a0a0a",
        "light-secondary": "#666666",
        "dark-primary": "#ffffff",
        "dark-secondary": "#a0a0a0",
      },
    },
  },
  plugins: [],
};
