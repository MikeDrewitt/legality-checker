// Libraries
const axios = require("axios");

// Services
const SlackService = require("./slack.service");

// Card Map - map that holds all local card data
const cardMap = {};

/**
 * Function that calls and sets all oracle card data from Scryfall
 * We're using this to keep all the card data in memory rather than having to look it up
 */
function fetchCards() {

  const SCRYFALL_BULK_JOSON = 'https://archive.scryfall.com/json/scryfall-oracle-cards.json';

  return axios.get(SCRYFALL_BULK_JOSON)
    .then(res => res.data)
    .then(cards => {
      for (const card of cards) set(card);
    })
    .then(() => SlackService.send(`Local card map updated ${new Date().toISOString()}`))
    .catch(err => {
      // For logging reasons
      console.error(err);
      SlackService.send(err.message);
    });
}


function set(card) {
  cardMap[card.name] = card;
}

function get(key) {
  return cardMap[key];
}

function getMap() {
  return cardMap;
}

module.exports = {
  set,
  get,
  getMap,
  fetchCards,
};

