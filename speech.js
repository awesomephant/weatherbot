var util = require('util');

module.exports = {
    likelihoodToEnglish: function (n) {
        n *= 1;
        switch (true) {
            case (n < 10):
                return 'Almost certainly not'
            case (n >= 11 && n <= 40):
                return 'Probably not'
            case (n >= 41 && n <= 60):
                return 'Even chances'
            case (n >= 61 && n <= 89):
                return 'Probably'
            case (n >= 90 && n <= 100):
                return 'Almost certainly'
        }
    },
    windSpeedToEnglish: function (speed) {
        console.log('Converting windspeed to english...')
        if (speed < 1){
            return 'wind calm'
        } else if (speed >= 1 && speed <= 11){
            return 'light breeze'
        } else if (speed >= 12 && speed < 28){
            return 'moderate breeze';
        } else if (speed >= 29 && speed <= 49){
            return 'strong breeze'
        } else if (speed >= 50) {
            return 'very strong wind'
        }
    },
    weatherTypeToEnglish: function (code) {
        switch (code) {
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
    windDirectionToEnglish: function (code) {
        switch (code) {
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
    }
}