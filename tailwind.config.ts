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
        strata: {
          blue: '#004270',
          'blue-dark': '#003258',
          'blue-light': '#005a9e',
          green: '#77a538',
          'green-dark': '#5e8429',
          'green-light': '#8dbf48',
          bg: '#f4f7f5',
          dark: '#363334',
          muted: '#6b7280',
          ink: '#16252d',
          line: '#dfe8e7',
          card: '#ffffff',
          amber: '#d98a1b',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(16 37 45 / 0.05), 0 12px 28px rgb(0 66 112 / 0.08)',
        'card-hover': '0 18px 36px rgb(0 66 112 / 0.14)',
        soft: '0 10px 24px rgb(16 37 45 / 0.08)',
      },
    },
  },
  plugins: [],
}

export default config
