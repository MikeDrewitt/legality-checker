
// Utils
const Messages = require("../../utils/messages.utils");

// Constants
const messages = require("../../constants/legality.constants");

// Rules
const { unlimitedCopies } = require("../../rules/index.rules")
const genericRules = require("../../rules/generic.rules");

/**
 * @params {Object - {mainboard, sideboard, maybeboard}}
 */
module.exports = function(deck) {

    const { mainboard, sideboard, commandZone } = deck;

    const mainboardExceptions = [];

    const errors = new Messages();
    const warnings = new Messages();

    if (sideboard.length) warnings.push(messages.IGNORING_SIDEBOARD);

    let commandZoneQuantity = 0;
    let mainboardQuantity = 0;

    let oathbreaker;
    let signitureSepll;

    const oathbreakerColorIdentity = {};

    // COMMAND ZONE LOGIC
    for (const commander of commandZone) {
        // If we the commander isn't included in the mainboard that's a request format error, so we're going to throw
        // rather than returning an error object, request will 400
        if (!mainboard.filter(card => card.name === commander.name).length)
            throw new Error(`${messages.COMMANDER_SIG_SPELL_REQUIRED_IN_MAINBOARD} - ${commander.name}`);

        commandZoneQuantity += parseInt(commander.quantity);

        if (commander.quantity > 1) errors.push(messages.SINGLETON_FORMAT, commander);
        if (commander.legalities.oathbreaker !== "legal") errors.push(messages.ILLEGAL_CARD, commander);

        for (const color of commander.colorIdentity) oathbreakerColorIdentity[color] = true;

        const typeLine = commander.typeLine.toLowerCase();

        const isPlaneswalker = typeLine.indexOf("planeswalker") !== -1;
        const isSpell = typeLine.indexOf("instant") !== -1 || typeLine.indexOf("sorcery") !== -1;

        if (!isPlaneswalker && !isSpell) errors.push(messages.OATHBREAKER_NOT_ALLOWED, commander);
        else if (isPlaneswalker) oathbreaker = commander;
        else if (isSpell) signitureSepll = commander;
    }

    if (!oathbreaker) errors.push(messages.MISSING_OATHBREAKER);
    if (!signitureSepll) errors.push(messages.MISSING_SIGNITURE_SPELL);
    if (commandZoneQuantity > 2) errors.push(messages.SINGLE_OATHBREAKER_AND_SIG_SPELL);

    // MAINBOARD LOGIC
    for (const card of mainboard) {
        mainboardQuantity += parseInt(card.quantity);

        if (card.legalities.oathbreaker !== "legal") errors.push(messages.ILLEGAL_CARD, card);

        // Check that the colors of the cards match the color identities of the commander(s)
        // Wish there was a more elegant way to do this
        for (const color of card.colorIdentity) {
            if (!oathbreakerColorIdentity[color]) errors.push(messages.OUTSIDE_COLOR_IDENTITY, card);
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
