
// Constants
const messages = require("../../constants/legality.constants");
const { unlimitedCopies } = require("../../rules/index.rules");

// Utils
const Messages = require("../../utils/messages.utils");

// Rules
const genericRules = require("../../rules/generic.rules");

/** 
 * @params {Object - {mainboard, sideboard, maybeboard}}
 */
module.exports = function(deck) {

    const { mainboard, sideboard } = deck;

    const mainboardExceptions = [];

    const errors = new Messages();
    const warnings = new Messages();

    if (sideboard.length) warnings.push(messages.IGNORING_SIDEBOARD);

    let sideboardQuantity = 0;
    let mainboardQuantity = 0;

    for (const card of sideboard) {

        sideboardQuantity += (parseInt(card.quantity));

        if (card.legalities.vintage !== "legal") errors.push(messages.ILLEGAL_CARD, card);
    }

    if (sideboardQuantity !== 15) errors.push(messages.SIDEBOARD_EXPECTED_SIZE);

    for (const card of mainboard) {
        mainboardQuantity += (parseInt(card.quantity));

        if (card.legalities.vintage !== "legal") errors.push(messages.ILLEGAL_CARD, card);

        if (unlimitedCopies[card.name]) {
            mainboardExceptions.push(card);
            continue;
        }

        // Check card quantity
    }

    if (mainboardExceptions.length) genericRules.mainboardRules(mainboardExceptions, errors);
    if (mainboardQuantity !== 60) errors.push(messages.EXPECTED_DECK_SIZE);

    return { errors: errors.data, warnings: warnings.data };
};
