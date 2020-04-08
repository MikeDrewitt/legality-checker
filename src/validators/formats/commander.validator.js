
// Utils
const Messages = require("../../utils/messages.utils");

// Constants
const messages = require("../../constants/legality.constants");

// Rules
const { ruleBreakingCards, ruleBreakingCommanders } = require("../../rules/index.rules");
const commanderRules = require("../../rules/commander.rules");

/**
 * Legality checker for commander
 * The order of this logic is fairly ridged. Be sure to understand fully why the code is orderd the way that it is
 * before making changes
 *
 * @params {Object - {mainboard, sideboard, maybeboard}}
 */
module.exports = function(deck) {

    const { mainboard, sideboard, commandZone } = deck;

    const commandZoneExceptions = [];
    const mainboardExceptions = [];

    const errors = new Messages();
    const warnings = new Messages();

    if (sideboard.length) warnings.push(messages.IGNORING_SIDEBOARD);

    let commandZoneQuantity = 0;
    let mainboardQuantity = 0;

    const commanderColorIdentity = {};

    // COMMAND ZONE LOGIC
    for (const commander of commandZone) {
        // If we the commander isn't included in the mainboard that's a request format error, so we're going to throw
        // rather than returning an error object, request will 400
        if (!mainboard.filter(card => card.name === commander.name).length)
            throw new Error(`Expecting '${commander.name}' to appear in mainboard as well as command zone`);

        commandZoneQuantity += parseInt(commander.quantity);

        if (commander.quantity > 1) errors.push(messages.SINGLETON_FORMAT, commander);
        if (commander.legalities.commander !== "legal") errors.push(messages.ILLEGAL_CARD, commander);

        for (const color of commander.colorIdentity) commanderColorIdentity[color] = true;

        // We don't do any specific checks if the commanders are part of the unique rule breaking subset
        // Continue the loop if we found one of those commanders
        if (ruleBreakingCommanders[commander.name]) {
            commandZoneExceptions.push(commander);
            continue;
        }

        // I looked it up, toLowerCase() + indexOf() is the fastest way to run string comparisons
        const typeLine = commander.typeLine.toLowerCase();

        if (typeLine.indexOf("legendary") === -1) errors.push(messages.LEGENDARY_COMMANDER, commander);
        if (typeLine.indexOf("creature") === -1) errors.push(messages.CREATURE_COMMANDER, commander);
    }

    if (commandZoneExceptions.length) commanderRules(commandZoneExceptions, errors);
    else if (commandZoneQuantity > 1) errors.push(messages.SINGLE_COMMANDER);

    // MAINBOARD LOGIC
    for (const card of mainboard) {
        mainboardQuantity += parseInt(card.quantity);

        if (ruleBreakingCards[card.name]) {
            mainboardExceptions.push(card);
            continue;
        }

        if (card.quantity > 1) errors.push(messages.SINGLETON_FORMAT, card);
        if (card.legalities.commander !== "legal") errors.push(messages.ILLEGAL_CARD, card);

        // Check that the colors of the cards match the color identities of the commander(s)
        // Wish there was a more elegant way to do this
        for (const color of card.colorIdentity) {
            if (!commanderColorIdentity[color]) errors.push(messages.OUTSIDE_COLOR_IDENTITY, card);
        }
    }

    if (mainboardQuantity !== 100) errors.push(messages.EDH_EXPECTED_DECK_SIZE);

    return { errors: errors.data, warnings: warnings.data };
}
