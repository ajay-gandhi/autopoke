
/**
 * Hosts the server that conducts the poking and begins new autopokers
 */

// NPM modules
var express = require('express');

// Local modules
var Poker = require('./poker');

var app    = express(),
    pokers = [];

// Address and port of server
var server_port       = 8080,
    server_ip_address = '127.0.0.1';

// Serve up static files from html subdir
app.use(express.static(__dirname + '/html'));

// Begin autopoking someone
app.get('/begin', function (req, res) {
  // Get params
  var email    = req.query.email,
      password = req.query.password,
      pokee    = req.query.pokee;

  // Make a new poker
  var newPoker = new Poker();

  // Initialize the poker with the given email and pw, then poke the person
  newPoker
    .init(email, password)
    .then(function (initialized) {

      if (initialized == false)
        // Login failed
        return {
          login: false,
          poked: false
        }

      else return initialized.poke(pokee);

    })
    .then(function (result) {
      // Just send result
      res.send(result);
    })
    .catch(function (err) {
      console.log(err);
    });
});

// Actually start the server
app.listen(server_port, server_ip_address, function () {
  console.log('Server running at', server_ip_address + ':' +server_port);
});
