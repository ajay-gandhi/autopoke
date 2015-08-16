
/**
 * Hosts the server that conducts the poking and begins new autopokers
 */

// NPM modules
var express = require('express');

// Local modules
var Poker = require('./poker');

var app    = express(),
    pokers = [];

/*********************************** Server ***********************************/

// Address and port of server
var server_port       = process.env.OPENSHIFT_NODEJS_PORT || 8080,
    server_ip_address = process.env.OPENSHIFT_NODEJS_IP   || '127.0.0.1';

// Serve up static files from html subdir
app.use(express.static(__dirname + '/html'));

// Begin autopoking someone
app.get('/begin', function (req, res) {
  // Get params
  var email    = req.query.email,
      password = req.query.password,
      pokee    = req.query.pokee;

  // Make a new poker
  var newPoker = new Poker(server_ip_address),
      inited;

  // Initialize the poker with the given email and pw, then poke the person
  newPoker
    .init(email, password)
    .then(function (initialized) {

      if (initialized == false) {
        // Login failed
        return {
          login: false,
          poked: false
        }

      } else {
        inited = initialized;
        return initialized.poke(pokee);
      }

    })
    .then(function (result) {
      // Just send result
      res.send(result);

      // Add to array if successful
      if (result.poked) {
        pokers.push(inited);
        console.log(email, 'is now autopoking', result.poked);
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});

// Actually start the server
app.listen(server_port, server_ip_address, function () {
  console.log('Server running at', server_ip_address + ':' +server_port);
});

/********************************* Autopoking *********************************/

/**
 * Iterate over the array of pokers, poking each
 */
var iterate_poke = function () {
  pokers.forEach(function (poker, index) {
    poker
      .poke()
      .then(function (result) {
        // Just delete the poker if it fails for some reason
        if (!result.poked) pokers.splice(index - 1, 1);
      });
  });

  // Set timeout again
  setTimeout(function () {
    iterate_poke();
  }, 30000);
}

setTimeout(function () {
  iterate_poke();
}, 30000);
