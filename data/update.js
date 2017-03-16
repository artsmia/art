var fs = require('fs')
var R = require('ramda')

var galleryInfo = require('./galleries.json')

var newNames = fs.readFileSync('/dev/stdin').toString()
.split("\n")
.map(line => line.split(','))
.filter(components => components.length == 2)
.map(([number, name]) => {
  console.info(number, galleryInfo.galleries[number], name) 
	var gal = galleryInfo.galleries[number] || galleryInfo.galleries[parseInt(number)]
	if(gal) gal.title = name
})

fs.writeFileSync('./galleries.json', JSON.stringify(galleryInfo))
