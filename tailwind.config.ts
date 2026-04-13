import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#F5F2EC',
          100: '#EDEAE2',
          200: '#C8D4E0',
          300: '#8A9AAC',
          400: '#4A5A6C',
          500: '#1A2332',
          600: '#18222E',
          700: '#1E2B3A',
          800: '#243344',
          900: '#111923',
        },
        gold: {
          light:  '#E2C06A',
          DEFAULT:'#C9A84C',
          dark:   '#A8882E',
          dim:    'rgba(201,168,76,0.12)',
        },
        teal: {
          DEFAULT:'#2DD4BF',
          dark:   '#1EBFAA',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body:    ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
