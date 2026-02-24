import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gitlab: {
          orange: "#FC6D26",
          purple: "#6B4FBB",
          dark: "#1F1F1F",
          darker: "#141414",
          card: "#252525",
          border: "#3A3A3A",
          muted: "#9CA3AF",
        },
      },
    },
  },
  plugins: [],
};
export default config;
