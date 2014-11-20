var express = require('express'),
    Poker   = require('./poker');

var newPoker = new Poker();

newPoker
  .init('email', 'password')
  .then(function (initialized) {
    return initialized.poke('Kevin Chavez');
  })
  .then(function (poked) {
    if (poked) {
      console.log('Poke successful!');
    } else {
      console.log('Poke failed.');
    }
  });