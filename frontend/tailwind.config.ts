import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          green: {
            900: '#14301B', // Deep forest green
            800: '#1F472B', // Medium rich green
            DEFAULT: '#276239', // Base green
            100: '#E6F0E9', // Light green background
          },
          gold: {
            DEFAULT: '#D4AF37', // Agricultural golden accents
            light: '#EED971',
          },
          earth: {
            DEFAULT: '#8B5A2B', // Soil tones
          }
        }
      },
      backgroundImage: {
        'hexagon-pattern': "url('/hex-pattern.svg')",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
