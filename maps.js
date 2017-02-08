'use strict'
require('dotenv').config()
var https = require('https');

module.exports = {
    geocode: function (address, callback) {
        var path = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=' + process.env.GOOGLE_KEY;
        https.get(path, (res) => {
            let rawData = '';
            res.on('data', (chunk) => rawData += chunk);
            res.on('end', () => {
                var data = JSON.parse(rawData)
                var results = {};
                results.coordinates = [
                    data.results[0].geometry.location.lat,
                    data.results[0].geometry.location.lng,
                ]
                results.formattedAddress = data.results[0].formatted_address;
                callback(results);
            })
        });
    }
}