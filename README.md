# Mediterraneabus API
<a href="https://paypal.me/fast0n" title="Donate"><img src="https://img.shields.io/badge/Donate-PayPal-009cde.svg?style=flat-square"></a>
[![Build Status](https://travis-ci.org/Fast0n/mediterraneabus-api.svg?branch=master)](https://travis-ci.org/Fast0n/mediterraneabus-api)

## Methods
#### search
Search for bus schedules and timetables for the Mediterraneabus S.p.A bus.

Parameters:
- periodo [required] - choice of period between 'invernale' and 'estiva'
- percorso_linea [required] - route bus line in the list data
- percorso_linea1 [required] - route bus line in the list data


Example Usage:
```
mediterraneabus-api.herokuapp.com/?periodo=invernale&
                                  percorso_linea=Ardore - stazione FS&
                                  percorso_linea1=Siderno - piazza Portosalvo
```
Returns
The standard JSON array

- title lines
- bus stop
- hours

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