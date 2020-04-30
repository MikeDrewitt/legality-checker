// Libraries
const axios = require("axios");

const CardService = require("../services/card.service");

const SCRY_API_URL = "https://api.scryfall.com/cards/named?exact=";

/**
 * Looks up an array of cards by their IDs. Really this is just a helper function so we don't have to much up
 * controllers. This function also is returning the quantity of the card with the data for the card such that all
 * the data for checking legality of the deck is on the card object
 *
 * If a card doesn't have an Id and error will be thrown
 *
 * TODO - We can change this to not use Scryfall and instead do something else at some point
 *
 * @param {Array<Card>} cards - { ..., id: "CARD_ID" }
 */
function fetchCards(cards = []) {
  return Promise.all(cards.map((card, index) => {
    if (!card.name) throw new Error(`Missing name for card at index - ${index}`);

    // Checking local card map so we can skip the network request if possible
    const localCardData = CardService.get(card.name);
    if (localCardData) return Promise.resolve({ ...serializeScryfall(localCardData), quantity: card.quantity });

    return axios.get(SCRY_API_URL + card.name).then(res => {
      // TODO - We can probably remove the serialization
      // I'm adding it such that we cut down the amount of actual logistics
      // needed in the actual legality checking
      return { ...serializeScryfall(res.data), quantity: card.quantity };
    });
  }))
    .catch(err => {
      if (err.response.status === 404) throw new Error(`404 could not find - ${err.response.request.path}`);
      throw err;
    });
}


/**
 * This function is used to convert scryfall's card structure into something a bit nicer for us to deal with.
 * Doing this after the request is returned allows us to cut down on the gross string parsing in the legality checkers
 * themselves.
 *
 * @param {Object} scryfallCard - RAW JSON object of a card returned from scryfall
 *    - example json https://api.scryfall.com/cards/3a1d0dad-18a8-489e-ac11-08f64b72fda4?format=json&pretty=true
 * @returns {Object} - legalityCardObject
 */
function serializeScryfall(scryfallCard) {
  return {
    name: scryfallCard["name"],
    cmc: scryfallCard["cmc"],
    manaCost: scryfallCard["mana_cost"],
    oracleText: scryfallCard["oracle_text"],
    colors: scryfallCard["colors"],
    colorIdentity: scryfallCard["color_identity"],
    typeLine: scryfallCard["type_line"],
    legalities: scryfallCard["legalities"],
  };
}

module.exports = {
  fetchCards
};
