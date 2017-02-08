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
    function (session, args) {

        session.sendTyping();
        var location = builder.EntityRecognizer.findEntity(args.entities, 'geo');
        var partial = builder.EntityRecognizer.findEntity(args.entities, 'weatherCondition');
        var date = builder.EntityRecognizer.findEntity(args.entities, 'builtin.datetime.date');
        var time = builder.EntityRecognizer.findEntity(args.entities, 'builtin.datetime.time');
        if (location) {
            session.dialogData.location = location;
        } else if (session.dialogData.location) {
            location = session.dialogData.location;
        }

        if (date) {
            session.dialogData.date = date;
        } else {
            date = session.dialogData.date;
        }
        if (date) {
            met.getForecastAddress(location.entity, date.resolution.date, function (data, mapsResult) {
                var formattedDate = dateFormat(date.resolution.date, 'dddd, mmm. d')
                if (partial.entity === 'rain') {
                    var rainPhrase = speech.likelihoodToEnglish(data.day.PPd);
                    session.send("%s. We think the chance of rain on %s is about %s%%", rainPhrase, formattedDate, data.day.PPd);
                } else if (partial.entity === 'temperature' || partial.entity === 'hot' || partial.entity === 'cold' || partial.entity === 'warm' || partial.entity === 'col') {
                    session.send("We think it's going to be up to %s°C during the day and around %s°C during the night.", data.day.Dm, data.night.Nm);
                } else if (partial.entity === 'wind' || partial.entity === 'windy') {
                    var direction = speech.windDirectionToEnglish(data.day.D)
                    session.send("We think the wind is going to be %smph coming from the %s. There might gusts of wind up to %smph.", data.day.S, direction, data.day.Gn);
                } else {
                    session.send("Here's the forecast for %s: Max temperature: %s, chance of rain %s%%", formattedDate, data.day.Dm, data.day.PPd);
                }
            });

        }
    },
    function (session, results) {
        session.endDialog();
    }
])