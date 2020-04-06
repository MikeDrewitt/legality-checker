// Libraries
const axios = require("axios");

const SCRY_API_URL = "https://api.scryfall.com/cards/";

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
    if (!card.id) throw new Error(`Missing ID at index ${index}`);

    return axios.get(SCRY_API_URL + card.id).then(res => {
      return { ...res.data, quantity: card.quantity };
    });
  }));
}

module.exports = {
  fetchCards
};
