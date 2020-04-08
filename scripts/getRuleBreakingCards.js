const axios = require("axios");
const process = require('process');

SCRYFALL_SEARCH = "https://api.scryfall.com/cards/search?q=";

const basicsRequest = axios.get(`${SCRYFALL_SEARCH}t:basic`).then(res => res.data);
const partnersRequest = axios.get(`${SCRYFALL_SEARCH}o:partner`).then(res => res.data);
const altCommandersRequest = axios.get(`${SCRYFALL_SEARCH}o:"can be your commander"`).then(res => res.data);
const companionsRequest = axios.get(`${SCRYFALL_SEARCH}o:companion`).then(res => res.data);
const anyQuantityRequest = axios.get(`${SCRYFALL_SEARCH}o:"a deck can have any number of cards"`).then(res => res.data);
const dwarvesRequest = axios.get(`${SCRYFALL_SEARCH}"Seven Dwarves"`).then(res => res.data);

// TODO - fix this so Will/Rowen Kenrith don't appear in both partners & walkers request
Promise.all([
    basicsRequest,
    partnersRequest,
    altCommandersRequest,
    companionsRequest,
    anyQuantityRequest,
    dwarvesRequest,
]).then(res => {
    return [
        ...res[0].data,
        ...res[1].data,
        ...res[2].data,
        ...res[3].data,
        ...res[4].data,
        ...res[5].data,
    ];
}).then(cards => {
    const cardNames = cards.map(card => card.name);
    console.log(cardNames);
}).catch(err => {
    console.error(err.message);
    process.exit(1);
}).finally(() => {
    process.exit(0);
});
