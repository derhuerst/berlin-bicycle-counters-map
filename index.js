'use strict'

const gl = require('mapbox-gl')
const getBerlinCounters = require('./lib/berlin-counters')
const human = require('approximate-number')
const interpolate = require('color-interpolate')
const minBy = require('lodash/minBy')
const maxBy = require('lodash/maxBy')

gl.accessToken = 'pk.eyJ1IjoiZ3JlZndkYSIsImEiOiJjaXBxeDhxYm8wMDc0aTZucG94d29zdnRyIn0.oKynfvvLSuyxT3PglBMF4w'
const map = new gl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/dark-v9',
	zoom: 13,
	hash: true,
	center: [13.5, 52.5]
})
map.addControl(new gl.NavigationControl(), 'top-left')

const createMarker = (counter, color) => {
	const el = document.createElement('div')
	el.setAttribute('class', 'counter')
	el.innerText = human(parseInt(counter.meta.count))
	el.style.backgroundColor = color

	new gl.Marker(el)
	.setLngLat([
		counter.meta.coordinates.longitude,
		counter.meta.coordinates.latitude
	])
	.addTo(map)
}

const palette = interpolate([
	'#c0392b', '#d35400', '#f39c12', '#f1c40f', '#27ae60', '#2ecc71'
])

getBerlinCounters()
.then((counters) => {
	const min = minBy(counters, 'meta.count').meta.count
	const max = maxBy(counters, 'meta.count').meta.count
	const getColor = count => palette((count - min) / max)

	for (let counter of counters) {
		createMarker(counter, getColor(counter.meta.count))
	}
})
.catch(console.error)
