import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "#e6e6e6",
        vfs: {
          orange: "#ED6B24",
          "orange-dark": "#D45A17",
          link: "#464feb",
          ink: "#1f2937",
          muted: "#6b7280",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
