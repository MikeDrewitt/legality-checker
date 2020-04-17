
// Messages
const messages = require("../constants/legality.constants");

// Rules
const { altCommanders } = require("./altCommanders.rules");
const { partners } = require("./partners.rules");

const PARTNER = "Partner";
const PARTNER_WITH = "Partner with";

/**
 * - Commander Exceptions can include
 *  - Partner
 *  - Partner with
 *  - Non creature commanders
 *
 * @param {Array<Object>} exceptions -  an array of card like objects that need futher validation for being a commander
 * @param {Messages} errors - Object that we can add errors to should we find any
 */
function commanderRules(exceptions, errors) {

    if (exceptions.length > 2) errors.push(messages.TOO_MANY_COMMANDERS);

    const commander = exceptions[0];
    const partner = exceptions[1];

    // We only have one exception card, it's an alt commander. No rules violations
    if (!partner && altCommanders[commander.name]) return;
    // We have a partner commander, but theres' only one of them. Weird - but no rules violation
    if (!partner && partners[commander.name]) return;

    const isPartnerWith = commander.oracleText.includes(PARTNER_WITH) && partner.oracleText.includes(PARTNER_WITH);
    const isPartner = !isPartnerWith && commander.oracleText.includes(PARTNER) && partner.oracleText.includes(PARTNER);

    if (isPartner) return;
    if (commander.oracleText.includes(partner.name) && partner.oracleText.includes(commander.name)) return;

    errors.push(messages.TOO_MANY_COMMANDERS);
};

/**
 * - Commander mainboard exceptions
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
    commanderRules,
    mainboardRules,
};
