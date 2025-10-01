import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))'
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui']
      }
    }
  },
  plugins: []
};

export default config;
