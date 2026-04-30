import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f3eefa',
          100: '#e0d4f0',
          200: '#c5a8e5',
          300: '#a67dd9',
          400: '#8a55ce',
          500: '#6b35b0',
          600: '#542c8c',
          700: '#3d1f68',
          800: '#1e0f3d',
          900: '#0f0720',
          950: '#070311',
        },
        brand: {
          DEFAULT: '#9333ea',
          hover: '#7e22ce',
          light: '#c084fc',
          muted: '#581c87',
        },
        accent: {
          cyan: '#22d3ee',
          teal: '#2dd4bf',
          gold: '#d4a574',
        },
      },
    },
  },
  plugins: [],
}

export default config
