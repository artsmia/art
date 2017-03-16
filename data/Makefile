updateSpaces:
	j named\ spaces\ for\ maps.xlsx | tail -n+3 | node update.js
	jq '.' galleries.json | sponge galleries.json
