/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#03397B',
        'primary-light': '#0a4fa3',
        'primary-dark': '#022a5e',
        teal: '#00A39D',
        'teal-light': '#00c4bd',
        'teal-dark': '#007d78',
      },
      fontFamily: {
        sans:   ['GTWalsheim-Regular'],
        light:  ['GTWalsheim-Light'],
        medium: ['GTWalsheim-Medium'],
        bold:   ['GTWalsheim-Bold'],
        black:  ['GTWalsheim-Black'],
      },
    },
  },
  plugins: [],
}
