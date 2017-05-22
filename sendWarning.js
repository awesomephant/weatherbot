var querystring = require('querystring')
var http = require('http')
var fs = require('fs')

var address = fs.readFileSync('./_data/user.json', 'utf8')

var postData = querystring.stringify({
  address : address,
  msg : "⚠️ **Weather warning:** We're predicting severe cold weather, icy conditions and heavy snow in parts of England between Tuesday 14 and Friday 17. If you're going to travelling during that time, please take extra care."
  //msg : "Hey, we've updated our forecast for your birthday. We now think it's going sunny at 26°C during the day, but we're expecting rain and colder temperatures starting about 21:00."
  //msg : "Hey Max, we've got a forecast for your birthday! We think that it's going to be sunny with a maximum temperature of 27°C."
  //msg : "Sure! June 11 is still too far away to make a prediction, but we'll update you once we know more."
});

var options = {
  hostname: 'localhost',
  port: 3978,
  path: '/api/notify',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

var req = http.request(options, (res) => {
  console.log(options);
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
  res.on('end', () => {
    console.log('No more data in response.');
  });
});

req.on('error', (e) => {
  console.log(`problem with request: ${e.message}`);
});

req.write(postData);
req.end();