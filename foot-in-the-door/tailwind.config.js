/** @format */
module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: {
    content: [
      './components/**/*.{js,ts,jsx,tsx}',
      './pages/**/*.{js,ts,jsx,tsx}',
    ],
  },
  theme: {
    extend: {
      colors: {
        black: '#232323',
      },
      height: {
        'screen-3/4': '75%',
        'screen-4/5': '80%',
      },
    },
  },
  variants: {
    display: ['responsive', 'hover', 'focus', 'group-hover', 'group-focus'],
    borderColor: ['focus-within'],
  },
  plugins: [],
}
