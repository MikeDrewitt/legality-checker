
// Constants
const messages = require("../../constants/legality.constants");


// TODO -  if we really want to use a class for this, we should more it somewhere more generic than here
class Messages {
    constructor() {
        this.data = [];
    }

    push(message, card) {
        if (card) this.data.push(`${message} - ${card.name}`);
        else this.data.push(message);
    }
}

/**
 * Legality checker for commander
 *
 * TODO -
 *  - @see TODOs
 *  - Color Identity
 *  - All unique cases of legal rule breaking
 *
 * @params {Object - {mainboard, sideboard, maybeboard}}
 */
module.exports = function (deck) {

    const { mainboard, sideboard, commandZone } = deck;
    const errors = new Messages();
    const warnings = new Messages();

    // TODO - this is not right. We need to check the quantity, not just the unique cards
    const deckLength = mainboard.length + commandZone.length;

    if (sideboard.length) warnings.push(messages.IGNORING_SIDEBOARD);
    if (deckLength !== 100) warnings.push(messages.EDH_EXPECTED_DECK_SIZE);

    const commanderColorIdentity = [];
    let parteners = false;

    for (const commander of commandZone) {
        commanderColorIdentity.push(...commander.colorIdentity);

        if (commander.oracleText.includes("partner")) parteners = true;

        if (!commander.typeLine.includes("Legendary")) errors.push(messages.LEGENDARY_COMMANDER, commander);
        if (!commander.typeLine.includes("Creature")) errors.push(messages.CREATURE_COMMANDER, commander);
    }

    if (!parteners && commandZone.length > 1) errors.push(messages.SINGLE_COMMANDER);

    for (const card of mainboard) {
        if (card.quantity > 1) errors.push(messages.SINGLE_COMMANDER, card);
        // TODO - Gotta do all the color identity checking here
    }

    return { errors: errors.data, warnings: warnings.data };
}
