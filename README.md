# Mediterraneabus API
[![Donate](https://img.shields.io/badge/Donate-PayPal-blue?style=flat-square)](https://paypal.me/fast0n) ![GitHub package.json version](https://img.shields.io/github/package-json/v/fast0n/mediterraneabus-api) [![License](https://img.shields.io/github/license/Fast0n/mediterraneabus-api)](https://github.com/Fast0n/mediterraneabus-api/blob/master/LICENSE) [![Build Status](https://travis-ci.org/Fast0n/mediterraneabus-api.svg?branch=master)](https://travis-ci.org/Fast0n/mediterraneabus-api) 

## Methods
#### search
Search for bus schedules and timetables for the Mediterraneabus S.p.A bus.

Parameters:
- periodo [required] - choice of period between 'invernale' and 'estiva'
- percorso_linea [required] - route bus line in the list data
- percorso_linea1 [required] - route bus line in the list data
- sort_by [optional] - choice of sort between 'time' and 'line'


Example Usage:
```
mediterraneabus-api.herokuapp.com/?periodo=invernale&
                                  percorso_linea=Ardore - stazione FS&
                                  percorso_linea1=Siderno - piazza Portosalvo
                                  &sort_by=time
```
Returns
The standard JSON array

- title lines
- bus stop
- timetables

## Methods
#### lista
Get list routes for the Mediterraneabus S.p.A bus.

Parameters:
- lista [optional] - empty


Example Usage:
```
mediterraneabus-api.herokuapp.com/?lista
```
Returns
The standard JSON array

- routes lines

# Result
![JSON result](img/result.png)