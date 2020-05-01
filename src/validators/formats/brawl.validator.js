
// Utils
const Messages = require("../../utils/messages.utils");

// Constants
const messages = require("../../constants/legality.constants");

// Rules
const { unlimitedCopies } = require("../../rules/index.rules");
const genericRules = require("../../rules/generic.rules");

/**
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
            throw new Error(`${messages.COMMANDER_REQUIRED_IN_MAINBOARD} - ${commander.name}`);

        commandZoneQuantity += parseInt(commander.quantity);

        if (commander.quantity > 1) errors.push(messages.SINGLETON_FORMAT, commander);
        if (commander.legalities.brawl !== "legal") errors.push(messages.ILLEGAL_CARD, commander);

        const typeLine = commander.typeLine.toLowerCase();

        if (typeLine.indexOf("legendary") === -1) errors.push(messages.LEGENDARY_COMMANDER, commander);
        if (typeLine.indexOf("creature") === -1) errors.push(messages.CREATURE_COMMANDER, commander);
    }

    if (commandZoneQuantity === 0) errors.push(messages.MISSING_COMMANDER);
    else if (commandZoneQuantity > 1) errors.push(messages.SINGLE_COMMANDER);

    // MAINBOARD LOGIC
    for (const card of mainboard) {
        mainboardQuantity += parseInt(card.quantity);

        if (card.legalities.brawl !== "legal") errors.push(messages.ILLEGAL_CARD, card);

        for (const color of card.colorIdentity) {
            if (!commanderColorIdentity[color]) errors.push(messages.OUTSIDE_COLOR_IDENTITY, card);
        }

        if (unlimitedCopies[card.name]) {
            mainboardExceptions.push(card);
            continue;
        }

        if (card.quantity > 1) errors.push(messages.SINGLETON_FORMAT, card);
    }

    if (mainboardExceptions.length) genericRules.mainboardRules(mainboardExceptions, errors);
    if (mainboardQuantity !== 60) errors.push(messages.BRAWL_EXPECTED_DECK_SIZE);

    return { errors: errors.data, warnings: warnings.data };
};
