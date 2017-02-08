var met = require('./met.js')
var maps = require('./maps.js')

var coordinates = [51.5074, 0.1278] //lat, long for london
// var site = met.findNearestSite(coordinates, function (site) {
//     met.getCurrentWeather(site.id);
// });

//maps.geocode('london');
met.getForecastAddress('london', null);
//met.findNearestFcsSite(coordinates, null);