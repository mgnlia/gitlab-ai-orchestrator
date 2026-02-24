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
          dark: "#1F1E24",
          darker: "#141217",
          card: "#252429",
          border: "#383640",
          text: "#FAFAFA",
          muted: "#9B9A9F",
        },
      },
    },
  },
  plugins: [],
};
export default config;
