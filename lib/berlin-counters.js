'use strict'

const Promise = require('pinkie-promise')
const {fetch} = require('fetch-ponyfill')({Promise})
const {stringify} = require('query-string')
const pMap = require('p-map')

const endpoint = 'https://berlin-bicycle-counters-rest.herokuapp.com/orgs'
const userAgent = 'derhuerst/berlin-cycle-counters-map'
const berlinOrg = 4728

const request = (route, query) => {
	return fetch(endpoint + route + '?' + stringify(query), {
		mode: 'cors',
		redirect: 'follow',
		headers: {'user-agent': userAgent}
	})
	.then((res) => {
		if (!res.ok) {
			const err = new Error(res.statusText)
			err.statusCode = res.status
			throw err
		}
		return res.json()
	})
}

const getBerlinCounters = () => {
	return request('/orgs/' + berlinOrg)
	.then((counters) => {
		const queryCounter = (counter) => {
			return request('/orgs/' + berlinOrg + '/counters/' + counter.id, {
				'table-id': counter.table,
				instruments: counter.instruments.join(','),
				start: Math.round(new Date(counter.periodStart) / 1000),
				end: Math.round(new Date(counter.periodEnd) / 1000)
			})
			.then((data) => ({meta: counter, data}))
		}

		return pMap(counters, queryCounter, {concurrency: 4})
	})
}

module.exports = getBerlinCounters
