const express = require('express');
const cheerio = require('cheerio');
const request = require('request');
const app = express();

app.get('/', function(req, res) {
	res.type('application/json');
	// check fields
	if (
		req.query.periodo == undefined &&
		req.query.percorso_linea == undefined &&
		req.query.percorso_linea1 == undefined
	) {
		var warning = {
			STATUS: '1',
			CODE: '200',
			MESSAGE: 'For help, go here -> https://github.com/Fast0n/mediterraneabus-api',
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
				var array_corse = [];
				var c = 0;
				var d = 0;
				var json = '';
				var keys = [];
				var orari = [];
				var x = [];
				var y = [];
				results.each(function(i, result) {
					var array = [];
					var array1 = [];
					var array2 = [];
					var num = 0;

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
									f[x] = f[x]
										.replace('.', ':')
										.replace(',', ':')
										.replace('\t', '')
										.replace('-', '')
										.slice(0, -1);

									if (f[x].split(':')[0].length == 1)
										f[x] = '0' + f[x].split(':')[0] + ':' + f[x].split(':')[1];
									else f[x] = f[x].split(':')[0] + ':' + f[x].split(':')[1];
								} else array2[x] = '';

								if (array2[x] != '') array2[x] = '"' + f[x].replace('\t', '') + '"';
								else array2[x] = '"' + '"';
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
					for (var e = 0; e < keys[s].length; e++) {
						if (keys[s][e] == req.query.percorso_linea) {
							for (var j = 0; j < orari[s][e].length; j++) {
								if (orari[s][e][j] != '""') {
									x = x.concat(orari[s][e][j]);
									array_corse = array_corse.concat(a[s]);
								}
							}
						}

						if (keys[s][e] == req.query.percorso_linea1) {
							for (var j = 0; j < orari[s][e].length; j++) {
								if (orari[s][e][j] != '""') {
									y = y.concat(orari[s][e][j]);
								}
							}
						}
					}
				}

				for (var z = 0; z < x.length; z++) {
					if (x[z] < y[z]) {
						//console.log(array_corse[z] +'\n ' + x[z] + ' ' + y[z]);

						if (array_corse[z] != array_corse[z - 1]) {
							json += ']},{"corsa" : "' + array_corse[z].replace('&#xA0;', '') + '", "orari": [ ';
						}

						json += ' {"partenza" : ' + x[z] + ', "arrivo" : ' + y[z] + '},';
					}
				}
				// print json
				json = '{ "linee": [ {' + json.replace(/},]},{/g, '}]},{') + ']}]}';

				res.send(json.replace(/},]}]}/g, '}]}]}').replace('{ "linee": [ {]},{', '{ "linee": [ {'));
			}
		});
	}
});

const server = app.listen(process.env.PORT, function() {});