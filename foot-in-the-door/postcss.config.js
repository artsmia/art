module.exports = {
  plugins: [
    'tailwindcss',
    'postcss-flexbugs-fixes',
    [
      'postcss-preset-env',
      {
        autoprefixer: {
          flexbox: 'no-2009',
        },
        stage: 2,
        features: {
          'custom-properties': false,
          'nesting-rules': true,
        },
      },
    ],
  ],
}
