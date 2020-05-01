
// Constants
const messages = require("../../constants/legality.constants");
const requestErrors = require("../../constants/errors.constants");
const { unlimitedCopies } = require("../../rules/index.rules");

// Utils
const Messages = require("../../utils/messages.utils");

// Rules
const genericRules = require("../../rules/generic.rules");

/**
 *
 * @params {Object - {mainboard, sideboard, maybeboard}}
 * @params {string} - format name
 */
module.exports = function(deck, format) {

    if (!format) throw new Error(requestErrors.MISSING_FORMAT);

    const { mainboard, sideboard } = deck;

    const mainboardExceptions = [];

    const errors = new Messages();
    const warnings = new Messages();

    if (sideboard.length) warnings.push(messages.IGNORING_SIDEBOARD);

    let sideboardQuantity = 0;
    let mainboardQuantity = 0;
    const cardQuantities = {};

    for (const card of sideboard) {

        sideboardQuantity += (parseInt(card.quantity));

        if (cardQuantities[card.name]) cardQuantities[card.name] += card.quantity;
        else cardQuantities[card.name] = card.quantity;

        if (card.legalities[format] !== "legal") errors.push(messages.ILLEGAL_CARD, card);
    }

    if (sideboardQuantity !== 15) errors.push(messages.SIDEBOARD_EXPECTED_SIZE);

    for (const card of mainboard) {
        mainboardQuantity += (parseInt(card.quantity));

        if (card.legalities[format] !== "legal") errors.push(messages.ILLEGAL_CARD, card);

        if (unlimitedCopies[card.name]) {
            mainboardExceptions.push(card);
            continue;
        }

        if (cardQuantities[card.name]) cardQuantities[card.name] += card.quantity;
        else cardQuantities[card.name] = card.quantity;
    }

    if (mainboardExceptions.length) genericRules.mainboardRules(mainboardExceptions, errors);
    if (mainboardQuantity !== 60) errors.push(messages.EXPECTED_DECK_SIZE);

    for (const cardName in cardQuantities) {
        if (cardQuantities[cardName] > 4) errors.push(messages.TOO_MANY_COPIES, { name: cardName });
    }

    return { errors: errors.data, warnings: warnings.data };
};
