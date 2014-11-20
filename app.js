var express = require('express'),
    Poker   = require('./poker');

var app = express();

var pokers = [];

// Openshift provides IPs
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

// Serve up static files from html subdir if requested
app.use(express.static(__dirname + '/html'));

// Begin autopoking someone
app.get('/begin', function (req, res) {
  // Get params
  var email = req.query.email;
  var password = req.query.password;
  var pokee = req.query.pokee;

  // Make a new poker
  var newPoker = new Poker();

  // Initialize the poker with the given email and pw, then poke the person
  newPoker
    .init(email, password)
    .then(function (initialized) {
      if (initialized == false) {
        res.send(JSON.stringify({
          login: false
        }));
      } else {
        return initialized.poke(pokee);
      }
    })
    .then(function (poked) {
      if (poked) {
        res.send(JSON.stringify({
          login: true,
          poked: true
        }));

      } else {
        res.send(JSON.stringify({
          login: true,
          poked: false
        }));
      }
    });
});

// Actually start the server
app.listen(server_port, server_ip_address, function() {
  console.log('Server running on port ' + server_port);
});