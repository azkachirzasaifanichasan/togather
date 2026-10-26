/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#7960d7",
        "primary-light": "#9d8ce6",
        dark: "#1f2937",
        muted: "#6b7280",
        panel: "#f9fafb",
      },
      borderRadius: {
        pill: "9999px",
        panel: "2rem",
        card: "1.5rem",
      },
    },
  },
  plugins: [],
};
