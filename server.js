const express = require('express');
const cheerio = require('cheerio');
const request = require('request');
const app = express();

app.get('/', function(req, res) {
	// check fields
	if (
		req.query.periodo == undefined &&
		req.query.percorso_linea == undefined &&
		req.query.percorso_linea1 == undefined
	) {
		var warning = {
			STATUS: '1',
			CODE: '200',
			MESSAGE: 'For help, go here -> https://github.com/Fast0n/Mediterraneabus-api',
			DATA: [],
			TOTALS: [],
		};
		res.json(warning);
	}
	if (
		req.query.periodo != undefined &&
		req.query.percorso_linea1 != undefined &&
		req.query.percorso_linea1 != undefined
	) {
		var JSONformData = {
			tipo_linee: 'percorso',
			stagione: req.query.periodo,
			giorno: 'feriale',
			percorso_linea: req.query.percorso_linea,
			percorso_linea1: req.query.percorso_linea1,
			btLineePercorso: '',
		};

		var options = {
			uri: 'http://www.mediterraneabus.com/linee',
			method: 'POST',
			json: true,
			form: JSONformData,
		};

		request(options, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				var html = body
					.replace(/<td><strong>Corse/g, '<td><titolo>Corse')
					.replace(/<td nowrap><strong>Fermate/g, '<td nowrap><null>Fermate')
					.replace(/<strong>Stagione/g, '<null>Stagione')
					.replace(/<strong>Orario/g, '<null>Orario')
					.replace(/<td><strong>/g, '<ts><strong>');

				const $ = cheerio.load(html);
				var results = $('table');

				var a = [];
				var keys = [];
				var values = [];
				var orari = [];
				var c = 0;
				var d = 0;
				var e = 0;
				var json = '';
				results.each(function(i, result) {
					var array = [];
					var array1 = [];
					var array2 = [];
					var num = 0;
					var x = 0;

					// get title lines
					var title = $(result)
						.find('tr')
						.find('td')
						.find('titolo')
						.html();
					if (title != '' && title != null) {
						var b = [title];
						a = a.concat(b);
					}

					// get bus stop
					$(result)
						.find('ts')
						.find('strong')
						.each(function(index, element) {
							array = array.concat([$(element).text()]);
						});
					if (array != '') {
						keys[c] = array;
						c++;
					}

					// get hours
					$(result)
						.find('tr')
						.children('ts')
						.each(function(index, element) {
							var f = $(element)
								.text()
								.split('\r\n');

							// regex Pattern
							var rePattern = new RegExp('([0-9]+.)');

							for (var x = 1; x < f.length; x++) {
								if (f[x].match(rePattern)) {
									f[x] = f[x].replace(/ /g, '');
								} else array2[x] = '';

								array2[x] =
									'"' +
									f[x]
										.replace('.', ':')
										.replace('\t', '')
										.replace('-', '')
										.replace(',', ':')
										.slice(0, -1) +
									'"';
							}
							if (array2 != '') {
								array1[num] = array2;
								array1[num] = array1[num].filter(Boolean);
								num++;
							}
						});

					if (array1 != '') {
						orari[d] = array1;
						d++;
					}
				});

				for (var s = 0; s < a.length; s++) {
					if (s == 0) {
						json += '"' + a[s].replace('&#xA0;', '') + '" : {';
					} else {
						json += '},"' + a[s].replace('&#xA0;', '') + '" : {';
					}
					for (var e = 0; e < keys[s].length; e++) {
						if (e != keys[s].length - 1) json += '"' + keys[s][e] + '":[' + orari[s][e] + '],';
						else json += '"' + keys[s][e] + '":[' + orari[s][e] + ']';
					}
				}

				// print json
				res.send('{' + json + '}}');
			}
		});
	}
});

exports = module.exports = app;
const server = app.listen(3000, function() {});
