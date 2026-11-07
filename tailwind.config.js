/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // LUMEN.AI Brand Palette
        lumen: {
          bg: '#080D18',
          sidebar: '#0C1322',
          card: '#111C2D',
          cardHover: '#162338',
          border: 'rgba(255, 255, 255, 0.08)',
          borderSubtle: 'rgba(255, 255, 255, 0.05)',
          emerald: '#10D6A0',
          'emerald-glow': 'rgba(16, 214, 160, 0.25)',
          cyan: '#55B8FF',
          'cyan-glow': 'rgba(85, 184, 255, 0.25)',
          text: '#F5F7FA',
          muted: '#8793A5',
          danger: '#FF647C',
          warning: '#FFBE69',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-emerald': '0 0 24px rgba(16, 214, 160, 0.22)',
        'glow-cyan': '0 0 24px rgba(85, 184, 255, 0.22)',
        'card-dark': '0 4px 20px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
};
