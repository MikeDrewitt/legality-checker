
const { allowedFormats } = require("../constants/formats.constants");

/**
 * Checks the format of the board and returns the board if there are no errors.
 *
 * @param {Array<>} board
 */
function validateBoard(board = []) {
    if (!board || !Array.isArray(board)) throw new Error("Main/Side/Command is missing or is not an array");
    return board;
};

/**
 * Checks the format on the request. Doing so this way allows us to do a bit more error checking and string manipulation
 * on the user supplied format.
 *
 * @param {*} userFormat - user supplied format - defaults to empty string
 */
function validateFormat(userFormat = "") {
    const format = userFormat.toLowerCase().trim();
    if (!format) throw new Error("Missing format");

    const officalFormat = allowedFormats[format];
    if (!officalFormat) throw new Error("Unknown format");

    return officalFormat;
};

/**
 * Function that checks the legality of a deck
 *
 * @param {Object} deck - { mainboard: Array<Card>, sideboard?: Array<Card>, commandZone?: Array>Card> }
 * @param {String} format - TODO - figure out a good way to check this format
 */
function validateLegality(deck, format) {
    const errors = [];
    const warnings = [];

    return { errors, warnings };
}

module.exports = {
    validateBoard,
    validateFormat,
    validateLegality,
};
