// Constants
const messages = require("../constants/legality.constants");

/**
 * - Mainboard exceptions
 *   - Basics & Rats & Apostles have no limitations
 *   - Check the count for dwarves :P
 *
 * @param {Array<Object>} exceptions -  an array of card like objects that need futher validation for being a commander
 * @param {Messages} errors - Object that we can add errors to should we find any
 */
function mainboardRules(exceptions, errors) {
    for (const card of exceptions) {
        if (card.name === "Seven Dwarves" && card.quantity > 7) errors.push(messages.SEVEN_DWARVES);
    }
};

module.exports = {
    mainboardRules,
};
