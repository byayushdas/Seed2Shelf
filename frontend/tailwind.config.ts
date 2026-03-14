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
            900: '#344E41', // Darkest Forest
            800: '#3A5A40', // Deep Moss
            DEFAULT: '#588157', // Base Earthy Green
            100: '#A3B18A', // Light Sage
            50: '#DAD7CD', // Cream / Light Sand
          },
          gold: {
            DEFAULT: '#A3B18A', // Mapping Gold to Sage for accents to maintain structural integrity
            light: '#DAD7CD',
          },
          earth: {
            DEFAULT: '#3A5A40', 
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
