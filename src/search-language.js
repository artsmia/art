var searchLanguageMap = (queryText) => {
	var map = {
		"recent:true": "Recent Accessions",
		"highlight:true": "Museum Highlights",
		'deaccessioned:"true"': "Deaccessioned",
		'_exists_:"provenance"': "provenance information exists",
		'_exists_:"related:conservation"': "Conserved artworks",
		'_exists_:"related:artstories"': "artworks with related ArtStories",
		'_exists_:"related:newsflashes"': "artworks with related NewsFlashes",
		'_exists_:"related:audio-stops"': "artworks with related Audio stops",
		'_exists_:"related:stories"': "artworks with related Mia Stories",
		'_exists_:"related:adopt-a-painting"': "Adopt-a-Painting",
		'_exists_:"related:visual-descriptions"': "has Verbal Description of Artwork",
		'_exists_:"related:inspiredByMia"': "Inspired By Mia",
		'_exists_:"list:aampi"': "Asian American and Pacific Islander Artists",
		'_exists_:"list:bhm"': "Black History at Mia",
		'_exists_:"list:eo"': "Eternal Offerings",
		"room:G*": "On View",
		'room:"Not on View"': "Not on View",
		"image:valid": "Image Available",
		"image:invalid": "Image Unavailable",
		'room:"G320"': "TODO: need to match parameters more cleverly? This should return 'In Gallery 320' or something",
		'_exists_:"list:nahm"': "Native American Heritage Month",
		'_exists_:"list:whm"': "Women's History Month",
		'_exists_:"list:pride-month"': "2SLGBTQIA+ Artists",
		'_exists_:"list:hispanic-heritage"': "Hispanic Heritage",
		'_exists_:"list:arts-of-americas"': "Arts of the Americas",
		'_exists_:"list:spookyseason"': "Spooky"
	}

	var reversedMap = Object.keys(map).reduce((reversed, key) => {
		reversed[map[key]] = key
		return reversed
	}, {})

	var trimmedQuery = queryText && queryText.trim()

	return map[trimmedQuery] || reversedMap[trimmedQuery] || queryText
}

module.exports = searchLanguageMap
