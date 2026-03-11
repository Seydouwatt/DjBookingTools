/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#dce8ff',
          500: '#4f6ef7',
          600: '#3b5bd9',
          700: '#2d46b9',
        },
        surface: {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          800: '#343a40',
          900: '#212529',
        },
      },
    },
  },
  plugins: [],
};
