'use strict'

var fs = require('fs');
var http = require('http');
require('dotenv').config()
var helpers = require('./helpers.js');
var maps = require('./maps.js');

module.exports = {
    getSiteCapabilities: function(siteID){

    },
    getForecastAddress: function (address, date, callback) {
        maps.geocode(address + ', uk', function (result) { //Append UK to make sure we only get places in the uk
            module.exports.findNearestFcsSite(result.coordinates, function (site) {
                module.exports.getForecast(site.id, date, function (data) {
                    callback(data, result);
                })
            })
        });
    },
    getCurrentWeatherAddress: function (address, callback) {
        maps.geocode(address + ', uk', function (mapsResult) { //Append UK to make sure we only get places in the uk
            module.exports.findNearestObsSite(mapsResult.coordinates, function (site) {
                module.exports.getCurrentWeather(site.id, function (data) {
                    callback(data, mapsResult);
                })
            })
        });
    },
    findNearestObsSite: function (location, callback) {
        fs.readFile('obs_sites.json', 'utf-8', function (err, data) {
            var sites = JSON.parse(data);
            console.log(sites.Locations.Location.length + ' sites found.\n');
            var closestSiteId = '';
            var closestDistance = 1000000; //count down from this
            var closestSiteIndex = 0;
            for (var i = 0; i < sites.Locations.Location.length; i++) {
                var site = sites.Locations.Location[i];

                var d = helpers.getDistance(location[0], location[1], site.latitude, site.longitude)
                if (d < closestDistance) {
                    closestDistance = d;
                    closestSiteId = site.id;
                    closestSiteIndex = i;
                    console.log('site #%s (%s): %skm', site.id, site.name, d);
                }
            }

            console.log('closestSiteId: ' + closestSiteId)
            callback(sites.Locations.Location[closestSiteIndex]);
        });
    },
    findNearestFcsSite: function (location, callback) {
        fs.readFile('fcs_sites.json', 'utf-8', function (err, data) {
            var sites = JSON.parse(data);
            console.log(sites.Locations.Location.length + ' sites found.\n');
            var closestSiteId = '';
            var closestDistance = 1000000; //count down from this
            var closestSiteIndex = 0;
            for (var i = 0; i < sites.Locations.Location.length; i++) {
                var site = sites.Locations.Location[i];

                var d = helpers.getDistance(location[0], location[1], site.latitude, site.longitude)
                if (d < closestDistance) {
                    closestDistance = d;
                    closestSiteId = site.id;
                    closestSiteIndex = i;
                    console.log('site #%s (%s): %skm', site.id, site.name, d);
                }
            }

            console.log('closestSiteId: ' + closestSiteId)
            callback(sites.Locations.Location[closestSiteIndex]);
        });
    },
    getCurrentWeather: function (siteID, callback) {
        var currentTime = new Date().getHours();
        var path = 'http://datapoint.metoffice.gov.uk/public/data/val/wxobs/all/json/' + siteID + '?res=hourly&key=' + process.env.METOFFICE_KEY;
        console.log(path);
        http.get(path, (res) => {
            let rawData = '';
            res.on('data', (chunk) => rawData += chunk);
            res.on('end', () => {
                var data = JSON.parse(rawData);
                var period = data.SiteRep.DV.Location.Period[1].Rep;

                // Take most reent observation
                var current = period[period.length - 1];

                console.log('Current Temperature: %s', current.T)
                console.log('Current Windspeed: %s', current.S)
                console.log('Current wind direction: %s', current.D)
                console.log('Weather Type: %s', current.W)

                callback(current);
            })
        });
    },
    getForecast: function (siteID, date, callback) {
        var currentTime = new Date().getHours();
        var path = 'http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/' + siteID + '?res=daily&key=' + process.env.METOFFICE_KEY;
        console.log(path);
        http.get(path, (res) => {
            let rawData = '';
            res.on('data', (chunk) => rawData += chunk);
            res.on('end', () => {
                var data = JSON.parse(rawData);
                var periods = data.SiteRep.DV.Location.Period
                var period = periods[1].Rep; //tomorrow
                var result = {};
                
                //Find Correct Period
                for (var i = 0; i < periods.length; i++){
                    let p = periods[i];
                    if (date + 'Z' === p.value){
                        // Take most reent observation
                        console.log('found forecast for %s', date)
                        result.day = p.Rep[0];
                        result.night = p.Rep[1];
                        callback(result);
                    }
                }
            })
        });
    }
}