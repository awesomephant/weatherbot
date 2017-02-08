var util = require('util');

module.exports = {
    likelihoodToEnglish: function(n){
        switch (n){
            case (n < 10):
                return 'Almost certainly not'
            case (n >= 0 && n <= 15):
                return 'Probably not'
            case (n >= 16 && n <= 60):
                return 'Even chances'
            case (n >= 61 && n <= 89):
                return 'Probably'
            case (n >= 90 && n <= 100):
                return 'Almost certainly'
        }
    },
    weatherTypeToEnglish: function(code){
        console.log('code: ' + code)
        switch (code){
            case '1':
                return '☀ Sunny'
            case '2':
            case '3':
                return '⛅️ Partly cloudy'
            case '5':
                return '🌫 Mist'
            case '7':
                return '☁️ Cloudy'
            case '8':
                return '☁️ Overcast'
            case '9':
            case '10':
            case '11':
            case '12':
                return '🌧 Light Rain'
            case '13':
            case '14':
            case '15':
                return 'Heavy Rain'
        }
    },
    windDirectionToEnglish: function(code){
        switch (code){
            case 'NNW':
            case 'N':
            case 'NNE':
                return 'north ⬆'
            case 'NE':
                return 'north-east ↗'
            case 'ENE':
            case 'E':
            case 'ESE':
                return 'east ➡'
            case 'SE':
                return 'south-east ↘'
            case 'SSE':
            case 'S':
            case 'SSW':
                return 'south ⬇'
            case 'SW':
                return 'south-west ↙'
            case 'WSW':
            case 'W':
            case 'WNW':
                return 'west ⬅'
            case 'NW':
                return 'nort-west ↖'
        }
    },
    currentWeatherToEnglish: function(data, result, callback){
        var weatherType = module.exports.weatherTypeToEnglish(data.W);
        var windDirection = module.exports.windDirectionToEnglish(data.D);
        console.log(weatherType);
        var s = util.format("Here's the current weather for %s: %s at %s°C, windspeed is %smph.",  result.formattedAddress, weatherType, data.T, data.S);
        return s;
    }
}