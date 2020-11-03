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
          600: '#939393',
          700: '#757575',
          800: '#161616',
          900: '#1F1F1F',
        },
      },
      minHeight: {
        48: '12rem',
        64: '16rem',
        'screen-3/5': '60vh',
      },
      maxHeight: {
        64: '16rem',
        128: '32rem',
        'screen-4/5': '80vh',
      },
      maxWidth: {
        12: '3rem',
        64: '16rem',
        96: '24rem',
        '2/5': '40%',
      },
      transitionProperty: {
        width: 'width, max-width',
      },
      spacing: {
        72: '18rem',
        96: '24rem',
        128: '32rem',
        'screen-3/4': '75vh',
        'screen-3/5': '60vh',
        'screen-4/5': '80vh',
      },
    },
  },
  variants: {
    display: ['responsive', 'hover', 'focus', 'group-hover', 'group-focus'],
    visibility: ['responsive', 'hover', 'group-hover'],
    opacity: ['hover', 'group-hover'],
    borderColor: ['focus-within'],
  },
  plugins: [require('@tailwindcss/typography')],
}
