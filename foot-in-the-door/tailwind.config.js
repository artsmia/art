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
        gray: {
          100: '#D3D3D3',
          200: '#F1F1F1',
          300: '#E1E1E1',
          400: '#6F6F6F',
          500: '#FAFAFA',
          700: '#757575',
          800: '#161616',
          900: '#1F1F1F',
        },
      },
      height: {
        'screen-3/4': '75%',
        'screen-4/5': '80%',
        96: '24rem',
      },
      maxWidth: {
        12: '3rem',
        64: '16rem',
        96: '24rem',
      },
      transitionProperty: {
        width: 'width, max-width',
      },
    },
  },
  variants: {
    display: ['responsive', 'hover', 'focus', 'group-hover', 'group-focus'],
    borderColor: ['focus-within'],
  },
  plugins: [],
}
