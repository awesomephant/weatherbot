var restify = require('restify');
var builder = require('botbuilder');
var met = require('./met.js');
var speech = require('./speech.js');
var dateFormat = require('dateformat');
var fs = require('fs');
var querystring = require('querystring')

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.use(restify.bodyParser());
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

intents.matches(/he+l+o+|hi+|hi+ya+|wha+ts*u+p+|he+y+|yo+|su+p+/g, [
    function (session) {
        var address = JSON.stringify(session.message.address);
        fs.writeFileSync('./_data/user.json', address)
        console.log('Address: ' + address)
        session.send('greeting');
        session.send('instructions');
    }
]);
var location;
var weather;
intents.matches('getCurrentWeather', [
    function (session, args, next) {
        location = builder.EntityRecognizer.findEntity(args.entities, 'geo');
        weather = builder.EntityRecognizer.findEntity(args.entities, 'weatherCondition');
        if (!location) {
            builder.Prompts.text(session, 'Which city or region would you like to know the weather for?')
        }
        else {
            next();
        }
    },
    function (session, results) {
        met.getCurrentWeatherAddress(location.entity, function (data) {
            if (data === 'ADDRESS_NOT_FOUND') {
                session.send("addressNotFound")
            } else {
                var weatherType = speech.weatherTypeToEnglish(data.W);
                var windDirection = speech.windDirectionToEnglish(data.D);
                var timeUnit = '';
                if (data.timeSinceObs === 1) {
                    timeUnit = 'minute'
                } else {
                    timeUnit = 'minutes'
                }
                session.send("currentWeather", data.timeSinceObs, timeUnit, data.maps.formattedAddress, weatherType, data.T, data.S);

            }
        });
    }
]);

intents.matches('getWeatherForecast', [
    function (session, args) {

        session.sendTyping();
        var location = builder.EntityRecognizer.findEntity(args.entities, 'geo');
        var partial = builder.EntityRecognizer.findEntity(args.entities, 'weatherCondition');
        var date = builder.EntityRecognizer.findEntity(args.entities, 'builtin.datetime.date');
        var time = builder.EntityRecognizer.findEntity(args.entities, 'builtin.datetime.time');
        if (!location) {
            location = 'london';
        }
        if (!partial) {
            partial = 'all'
        }
        if (date) {
            met.getForecastAddress(location.entity, date.resolution.date, function (data) {
                var formattedDate = dateFormat(date.resolution.date, 'dddd, mmm. d')
                var weatherType = speech.weatherTypeToEnglish(data.day.W);
                var windDirection = speech.windDirectionToEnglish(data.day.D);
                var windSpeed = speech.windSpeedToEnglish(data.day.S);

                if (partial.entity === 'rain') {
                    var rainPhrase = speech.likelihoodToEnglish(data.day.PPd);
                    session.send("rainForecast", rainPhrase, data.day.PPd);
                } else if (partial.entity === 'temperature' || partial.entity === 'hot' || partial.entity === 'cold' || partial.entity === 'warm' || partial.entity === 'col') {
                    session.send("temperatureForecast", data.day.Dm, data.night.Nm);
                } else if (partial.entity === 'wind' || partial.entity === 'windy') {
                    var direction = speech.windDirectionToEnglish(data.day.D)
                    session.send("windForecast", data.day.S, direction, data.day.Gn);
                } else {
                    session.send("generalForecast", formattedDate, weatherType, data.day.PPd, windSpeed, data.day.Dm);
                }
            });

        }
    },
    function (session, results) {
        session.endDialog();
    }
])

intents.matches('getConfidence', [
    function (session) {
        session.send('confidence')
    }
])

server.post('/api/notify', function (req, res) {
    // Process posted notification
    console.log('Notification received.')
    var data = querystring.parse(req.body);
    var address = JSON.parse(data.address);
    var notification = data.msg;
    // Send notification as a proactive message
    var msg = new builder.Message()
        .address(address)
        .text(notification);
    bot.send(msg, function (err) {
        // Return success/failure
        res.status(err ? 500 : 200);
        res.end();
    });
    res.end();
});