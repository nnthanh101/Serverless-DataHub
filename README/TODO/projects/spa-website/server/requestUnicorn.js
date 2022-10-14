const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const awssem = require('aws-serverless-express/middleware');
const randomBytes = require('crypto').randomBytes;

// Configure the appropriate region for the app
const region = process.env.MOBILE_HUB_PROJECT_REGION || process.env.REGION || 'us-east-1';
AWS.config.update({ region: region })
let databaseTableName = 'Rides';
if (process.env.MOBILE_HUB_DYNAMIC_PREFIX) {
    databaseTableName = process.env.MOBILE_HUB_DYNAMIC_PREFIX + '-Rides';
}

// In a real app, this would be placed into a database table
const fleet = [
  { Name: 'Bucephalus', Color: 'Golden', Gender: 'Male' },
  { Name: 'Shadowfax', Color: 'White', Gender: 'Male' },
  { Name: 'Rocinante', Color: 'Yellow', Gender: 'Female'}
];

// declare a new express app
var app = express()
app.use(awssem.eventContext({ deleteHeaders: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});

// Create a DynamoDb connection
const ddb = new AWS.DynamoDB.DocumentClient();

// Respond to POST /requestUnicorn
app.post('/ride', function(req, res) {
  const requestContext = req.apiGateway.event.requestContext;

  const rideId = randomBytes(16)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const username = requestContext.identity.cognitoIdentityId;
  const pickupLocation = req.body.PickupLocation;

  // Select a unicorn from the fleet.  A more normal implementation
  // will use a routing algorithm to select from a database.
  const unicorn = fleet[Math.floor(Math.random() * fleet.length)];

  // This is the item we will insert into the database
  const ddbItem = {
    RideId: rideId,
    User: username,
    Unicorn: unicorn,
    UnicornName: unicorn.Name,
    RequestTime: new Date().toISOString(),
    PickupLocation: pickupLocation
  };

  console.log(`Inserting data into ${region}:${databaseTableName}`);
  ddb.put({ TableName: databaseTableName, Item: ddbItem },
    function (err, data) {
      if (err) {
        console.log('error: ', err);
        res.status(500).json({
          Error: err.message,
          Reference: req.requestId
        });
      } else {
        console.log('success: ', data);
        res.status(201).json({
          RideId: rideId,
          Unicorn: unicorn,
          UnicornName: unicorn.Name,
          Eta: 30,
          Rider: username
        });
      }
    }
  );
});

// Work the local server proxy so that it listens on port 3000
// Note that the yarn start server also runs on port 3000, so
// you can't run them at the same time.
app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this
// does nothing. However, to port it to AWS Lambda we will create a
// wrapper around that will load the app from this file
module.exports = app
