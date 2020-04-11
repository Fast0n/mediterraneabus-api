const express = require("express");
const cheerio = require("cheerio");
const request = require("request");
const sortJsonArray = require("sort-json-array");
const app = express();

app.get("/", function(req, res) {
  res.type("application/json");
  // check fields

  if (req.query.lista != undefined) {
    var options = {
      uri: "http://www.mediterraneabus.com/",
      method: "POST",
      json: true
    };

    request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(body);

        var array = [];

        var results = $("body");
        results.each(function(i, result) {
          // take a version
          $(result)
            .find("div.contBox")
            .find("tbody")
            .find('select[name="percorso_linea"]')
            .find("option")
            .each(function(index, element) {
              array = array.concat([$(element).text()]);
            });

          var data_store = {};
          data_store["list"] = {};
          data_store["list"]["routes"] = [];

          for (var j = 2; j < array.length; j++) {
            var value = array[j].replace("&apos;", "'");
            var value2 = array[j - 1].replace("&apos;", "'");
            if (value != value2) data_store["list"]["routes"][j - 2] = value;
          }

          data_store["list"]["routes"] = data_store["list"]["routes"].filter(
            () => true
          );

          res.send(data_store);
        });
      }
    });
  } else if (
    req.query.periodo == undefined &&
    req.query.percorso_linea == undefined &&
    req.query.percorso_linea1 == undefined
  ) {
    var warning = {
      STATUS: "1",
      CODE: "200",
      MESSAGE:
        "For help, go here -> https://github.com/Fast0n/mediterraneabus-api",
      DATA: [],
      TOTALS: []
    };
    res.json(warning);
  }

  if (
    req.query.periodo != undefined &&
    req.query.percorso_linea1 != undefined &&
    req.query.percorso_linea1 != undefined &&
    req.query.sort_by == "time"
  ) {
    view_timetable(true);
  } else if (
    req.query.periodo != undefined &&
    req.query.percorso_linea1 != undefined &&
    req.query.percorso_linea1 != undefined &&
    req.query.sort_by == "line"
  ) {
    view_timetable(false);
  } else if (
    req.query.periodo != undefined &&
    req.query.percorso_linea1 != undefined &&
    req.query.percorso_linea1 != undefined
  ) {
    view_timetable(false);
  }

  function view_timetable(result) {
    var JSONformData = {
      cmd: "elenco",
      tipo_linee: "percorso",
      stagione: req.query.periodo,
      giorno: "feriale",
      percorso_linea: req.query.percorso_linea,
      percorso_linea1: req.query.percorso_linea1,
      btLineePercorso: ""
    };

    var options = {
      uri: "http://www.mediterraneabus.com/chkLinee.php",
      method: "POST",
      json: true,
      form: JSONformData
    };

    request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var html = body
          .replace(/<td><strong>Corse/g, "<td><titolo>Corse")
          .replace(/<td nowrap><strong>Fermate/g, "<td nowrap><null>Fermate")
          .replace(/<strong>Stagione/g, "<null>Stagione")
          .replace(/<strong>Orario/g, "<null>Orario")
          .replace(/<td><strong>/g, "<ts><strong>");

        const $ = cheerio.load(html);
        var results = $("table");
        var data_store = {};
        var json_store = [];

        var var_a = [];
        var keys = [];
        var orari = [];
        var var_b = 0;
        var var_c = 0;
        results.each(function(i, result) {
          var array = [];
          var array1 = [];
          var array2 = [];
          var var_d = 0;

          // get title lines
          var title = $(result)
            .find("tr")
            .find("td")
            .find("titolo")
            .html();
          if (title != "" && title != null) {
            var b = [title];
            var_a = var_a.concat(b);
          }

          // get bus stop
          $(result)
            .find("ts")
            .find("strong")
            .each(function(index, element) {
              array = array.concat([$(element).text()]);
            });
          if (array != "") {
            keys[var_b] = array;
            var_b++;
          }

          // get hours
          $(result)
            .find("tr")
            .children("ts")
            .each(function(index, element) {
              var time = $(element)
                .text()
                .split("\n\t\t\t\t\t\t\t");

              // regex Pattern
              var rePattern = new RegExp("([0-9]+.)");

              for (var x = 0; x < time.length; x++) {
                if (time[x].match(rePattern)) {
                  time[x] = time[x]
                    .replace(".", ":")
                    .replace(",", ":")
                    .replace("\t", "")
                    .replace("-", "")
                    .replace("Apri/stampa", "");

                  if (time[x].split(":")[0].length == 1)
                    time[x] =
                      "0" + time[x].split(":")[0] + ":" + time[x].split(":")[1];
                  else
                    time[x] =
                      time[x].split(":")[0] + ":" + time[x].split(":")[1];
                } else array2[x] = "";

                if (array2[x] != "") array2[x] = time[x].replace("\t", "");
                else array2[x] = "";
              }
              if (array2 != "") {
                array1[var_d] = array2;
                array1[var_d] = array1[var_d].filter(Boolean);
                var_d++;
              }
            });

          if (array1 != "") {
            orari[var_c] = array1;
            var_c++;
          }
        });

        for (var x = 0; x < var_a.length; x++) {
          data_store[x] = [];

          for (var counter = 0; counter < keys[x].length; counter++) {
            data_store[x]["title"] = var_a[x];
            data_store[x][keys[x][counter]] = orari[x][counter];
          }
        }

        var global_counter = 0;

        for (var y = 0; y < Object.keys(data_store).length; y++) {
          try {
            for (
              var z = 0;
              z < data_store[y][req.query.percorso_linea].length;
              z++
            ) {
              if (
                data_store[y][req.query.percorso_linea][z] != undefined ||
                data_store[y][req.query.percorso_linea1][z] != undefined
              ) {
                json_store[global_counter] = {};

                for (var counter = -1; counter < z; counter++) {
                  if (
                    data_store[y][req.query.percorso_linea1][counter + 1] >
                    data_store[y][req.query.percorso_linea][counter + 1]
                  ) {
                    json_store[global_counter]["a"] = data_store[y]["title"];
                    json_store[global_counter]["b"] =
                      data_store[y][req.query.percorso_linea][counter + 1];
                    json_store[global_counter]["c"] =
                      data_store[y][req.query.percorso_linea1][counter + 1];
                  }
                }
                global_counter++;
              }
            }
          } catch (err) {}
        }
        if (result == false) res.send(sortJsonArray(json_store, "a"));
        else res.send(sortJsonArray(json_store, "b"));
      }
    });
  }
});

const server = app.listen(process.env.PORT || 1331, function() {});
