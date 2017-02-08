'use strict'
var http = require('http');
var fs = require('fs');
require('dotenv').config()

var getSitelist = function () {
    var path = 'http://datapoint.metoffice.gov.uk/public/data/val/wxobs/all/json/sitelist?key=' + process.env.METOFFICE_KEY;
    http.get(path, (res) => {
        let rawData = '';
        res.on('data', (chunk) => rawData += chunk);
        res.on('end', () => {
            var json = JSON.parse(rawData);
            fs.writeFileSync('./_data/obs_sites.json', JSON.stringify(json, null, ' '))
            console.log(rawData);
        })
    });
}

getSitelist();
