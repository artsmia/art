module.exports = () => {
  const whiteTextOnBlackWithPadding = `
    font-family: MiaGrotesk-Light, Arial;
    background-color: #232323;
    color: white;
    padding: .5em;
    font-size: 2em;
    line-height: 3em;
  `

  console.log(
    `%cminneapolis institute of art\n%c“Inspiring wonder through the power of art.”\n\nhttps://collections.artsmia.org/info/open-access\nhttps://github.com/artsmia/art`,
    whiteTextOnBlackWithPadding,
    ''
  )
}
