/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B1220',
        slate: {
          950: '#0B1220'
        },
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#b3ccff',
          300: '#82abff',
          400: '#4f83ff',
          500: '#2660f2',
          600: '#1a49d1',
          700: '#1739a6',
          800: '#173485',
          900: '#172e6b'
        },
        amber: {
          400: '#f6b93b',
          500: '#f2a022',
          600: '#d9840f'
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,18,32,0.06), 0 8px 24px -12px rgba(11,18,32,0.15)'
      }
    }
  },
  plugins: []
};
