/**
 * This module controls a browser for a specific person
 */
var Zombie  = require('zombie'),
    Promise = require('es6-promise').Promise;

/*********************************** Module ***********************************/

module.exports = (function () {

  function Poker() {
    this.browser = new Zombie();
    this.home    = 'http://m.facebook.com';
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
      browser
        .visit(self.home)
        .then(function () {

          // Fill in the credentials
          browser.fill('email', email);
          browser.fill('pass', password);

          return browser.pressButton('Log In');
        })
        .then(function () {

          // Logged in, new page loaded
          var title = browser.text('title');

          // Check if login was successful
          if (title === 'Welcome to Facebook') {
            // Still on login page
            resolve(false);

          } else {
            // Login successful
            resolve(self);
          }
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
      // Search for pokee in new tab
      browser
        .visit(self.home)
        .then(function () {
          browser.fill('query', pokee);
          return browser.pressButton('Search');
        })
        .then(function () {

          // Assume first result is correct
          var search_results_table = browser.queryAll('table')[1];
          var firstResult          = search_results_table.querySelector('a');

          // Save who was actually poked
          actual_poke_name = firstResult.textContent;

          // Visit their profile
          return browser.clickLink(firstResult);
        })
        .then(function () {
          // There's a poke link at the bottom
          return browser.clickLink('Poke');
        })
        .then(function () {
          // Return
          console.log('Just poked', actual_poke_name);
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
          console.log(e);
        });
    });
  }

  return Poker;

})();
