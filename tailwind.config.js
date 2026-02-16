/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0D1B2A",
        secondary: "#1B263B",
        gold: "#F4B400",
        lightning: "#FFC107",
        light: "#F5F5F5",
      },
    },
  },
  plugins: [],
};
