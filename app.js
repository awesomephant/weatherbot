var restify = require('restify');
var builder = require('botbuilder');
var met = require('./met.js');
var speech = require('./speech.js');
var dateFormat = require('dateformat');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/14da8cad-03c6-4e01-9c30-a91d33db8bfe?subscription-key=a9439a78c2574f75b44a14a11c7d2cf3&verbose=true';
var recognizer = new builder.LuisRecognizer(model);
var intents = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', intents);

//=========================================================
// Bots Dialogs
//=========================================================

intents.matches('getCurrentWeather', [
    function (session, args, next) {
        var location = builder.EntityRecognizer.findEntity(args.entities, 'geo');
        var weather = builder.EntityRecognizer.findEntity(args.entities, 'weatherCondition');
        if (location) {
            met.getCurrentWeatherAddress(location.entity, function (data, result) {
                session.send(speech.currentWeatherToEnglish(data, result))
            });
        }
        if (weather) {
            //            session.send('weather: %s', weather.entity)
        }
        next();
    },
    function (session, results) {
        //      session.send("Ok");
    }
]);

intents.matches('getWeatherForecast', [
    function (session, args, next) {
        var location = builder.EntityRecognizer.findEntity(args.entities, 'geo');
        var weather = builder.EntityRecognizer.findEntity(args.entities, 'weatherCondition');
        var date = builder.EntityRecognizer.findEntity(args.entities, 'builtin.datetime.date');
        var time = builder.EntityRecognizer.findEntity(args.entities, 'builtin.datetime.time');
        if (location) {
        }
        if (weather) {
            //            session.send('weather: %s', weather.entity)
        }
        if (date) {
            console.log('date entity: %s', date.entity)
            console.log('date resolution: %s', date.resolution.date)
            console.log('date res: %s', date.resolution.date)
            met.getForecastAddress(location.entity, date.resolution.date, function (data, mapsResult) {
                var formattedDate = dateFormat(date.resolution.date, 'dddd, mmm. d')
                session.send("Here's the forecast for %s: Max temperature: %s, chance of rain %s%%", formattedDate, data.day.Dm, data.day.PPd);
            });

        }
        next();
    },
    function (session, results) {
        session.endDialog();
    }
])