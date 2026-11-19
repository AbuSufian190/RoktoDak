/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#B91C1C', bright: '#EF4444', soft: '#FEF2F2' },
        ink: '#1F2937',
        mist: '#F9FAFB',
      },
      fontFamily: {
        sans: ['Inter', '"Hind Siliguri"', 'system-ui', 'sans-serif'],
        bn: ['"Hind Siliguri"', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
