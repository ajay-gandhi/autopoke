
/**
 * Server that conducts the poking and creates new autopokers
 */

// NPM modules
var express = require('express'),
    rp      = require('./rp'),
    qs      = require('querystring');

require('string_score');

// Local modules
var Poker = require('./poker');

/*********************************** Server ***********************************/

var app    = express(),
    pokers = [];

// Address and port of server
var server_port       = process.env.OPENSHIFT_NODEJS_PORT || 8080,
    server_ip_address = process.env.OPENSHIFT_NODEJS_IP   || '127.0.0.1';

var app_secret = require('./captcha.json').key;

// Serve up static files from html subdir
app.use(express.static(__dirname + '/html'));

// Start or stop autopoking someone
app.get('/submit', function (req, res) {

  // First verify captcha
  var verify_opts = {
    url:    'https://www.google.com/recaptcha/api/siteverify',
    qs:     { secret: app_secret, response: req.query.captcha },
    method: 'GET'
  }

  rp(verify_opts)
    .then(function (body) {
      body = JSON.parse(body);

      if (body.success) {
        // Get params
        var email    = req.query.email,
            password = req.query.password,
            pokee    = req.query.pokee,
            start_p  = req.query.start_p;

        // Start poking poker
        if (start_p === 'true') {
          var newPoker = new Poker(),
              inited;

          // Initialize the poker with the given email and pw, then poke the person
          newPoker
            .init(email, password)
            .then(function (initialized) {

              if (initialized == false) {
                // Login failed
                return {
                  success: false,
                  reason:  'Login failed.'
                }

              } else {
                inited = initialized;
                return initialized.poke(pokee);
              }

            })
            .then(function (result) {

              // Add to array if successful
              if (result.poked) {

                // Ensure not already poking
                for (var i = 0, poker = pokers[i]; i < pokers.length; i++) {
                  if (poker.email === email && poker.pokee === result.poked) {
                    res.send({
                      success: false,
                      reason:  'You are already poking that person.'
                    });

                    return;
                  }
                }

                // Otherwise good, just send result
                res.send({
                  success: result.poked
                });

                pokers.push(inited);
                console.log(email, 'is now autopoking', result.poked);

              } else {
                res.send({
                  success: false,
                  reason:  'Poke failed.'
                });
              }
            })
            .catch(function (err) {
              console.log(err);
            });

        // Stop poking someone (delete poker obj)
        } else {

          // First verify login info
          var newPoker = new Poker(),
              inited;

          // Initialize the poker with the given email and pw, then poke the person
          newPoker
            .init(email, password)
            .then(function (initialized) {

              if (initialized == false) {
                // Login failed
                res.send({
                  success: false,
                  reason:  'Login failed.'
                });

              } else {
                // Login successful, remove poke
                // First score all
                var max_score = 0,
                    max_idx,
                    stopped_poking;
                pokers.forEach(function (poker, index) {
                  var score = poker.pokee.toLowerCase().score(pokee);
                  console.log(score);

                  // Update vars if score greater
                  if (poker.email === email && score > max_score) {
                    max_score      = score;
                    max_idx        = index;
                    stopped_poking = poker.pokee;
                  }
                });

                // Delete poker at max index
                if (max_idx || max_idx == 0) {
                  pokers.splice(max_idx - 1, 1);

                  console.log(email, 'is no longer poking', stopped_poking);
                  res.send({
                    success: stopped_poking
                  });

                // No one matched
                } else {
                  res.send({
                    success: false,
                    reason:  'No one is being poked by that name.'
                  });
                }
              }

            })
            .catch(function (err) {
              console.log(err);
            });

        }

      } else {
        res.send({
          success: false,
          reason:  'Incorrect CAPTCHA.'
        });
      }
    });

});

// Just send some stats for funzies
app.get('/stats', function (req, res) {
  res.send({
    pokers: pokers.length
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
        if (!result.poked) {
          console.log(poker.email, 'is no longer poking', poker.pokee,
            'because of an error');
          pokers.splice(index - 1, 1);
        }
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
