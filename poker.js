/**
 * This module handles poking for a specific person
 */
var rp      = require('./rp'),
    cheerio = require('cheerio'),
    qs      = require('querystring'),
    Promise = require('es6-promise').Promise;

rp = rp.defaults({ jar: true });

/*********************************** Module ***********************************/

module.exports = (function () {

  function Poker() {
    this.browser = rp;
    this.home = 'https://m.facebook.com';
    this.pokee;
  }

  /**
   * Init function for the object. Creates a headless browser and logs into
   *   Facebook with the given email and password
   *
   * @param [string] email    - The email address used to login to Facebook
   * @param [string] password - The password for the Facebook account
   *
   * @returns [Promise] An initialized Poker object if the login was successful
   *   or false if the login failed.
   */
  Poker.prototype.init = function (email, password) {
    var self    = this,
        browser = self.browser;

    return new Promise(function (resolve, reject) {

      var credentials = {
        email: email,
        pass:  password
      }

      var options = {
        url:    self.home + '/login.php',
        body:   qs.stringify(credentials),
        method: 'POST'
      }

      browser(options)
        .then(function () {
          // Visit main page
          return browser(self.home);
        })
        .then(function (body) {
          var $ = cheerio.load(body);

          // Confirm login
          if ($('title').text() === 'Facebook') resolve(self);
          else                                  resolve(false);

        })
        .catch(function (e) {
          resolve(false);
          console.trace(e);
        });
    });
  }

  /**
   * Pokes someone whose name is the closest match to pokee
   *
   * @param [string] pokee - The name of the person to poke
   *
   * @returns [Promise] True if the person was poked, otherwise false
   */
  Poker.prototype.poke = function (pokee) {
    var self       = this,
        browser    = self.browser;

    // Save or fetch pokee
    if (!pokee) pokee = self.pokee;
    else        self.pokee = pokee;

    var actual_poke_name;

    return new Promise(function (resolve, reject) {
      // Search for pokee
      browser(self.home + '/search/?query=' + encodeURIComponent(pokee))
        .then(function (body) {

          // Visit first profile
          $ = cheerio.load(body);
          var first = $('div#root td:nth-child(2) a').first();
          actual_poke_name = first.text();
          return browser(self.home + first.attr('href'));
        })
        .then(function (body) {

          // Find and click poke link
          $ = cheerio.load(body);
          var poke = $('div#timelineBody a').filter(function() { return $(this).text() === 'Poke'; });

          return browser('https://m.facebook.com' + poke.attr('href'));
        })
        .then(function () {
          resolve({
            login: true,
            poked: actual_poke_name
          });
        })
        .catch(function (e) {
          resolve({
            login: true,
            poked: false
          });
          console.trace(e);
        });
    });
  }

  return Poker;

})();
