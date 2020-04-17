
const { allowedFormats } = require("../constants/formats.constants");
const errors = require("../constants/errors.constants");

const formats = require("./formats/format.rollup");

/**
 * Checks the format of the board and returns the board if there are no errors.
 *
 * @param {Array<>} board
 */
function validateBoard(board = []) {
    if (!board || !Array.isArray(board)) throw new Error(errors.BOARD_ERROR);
    return board;
};

/**
 * Checks the format on the request. Doing so this way allows us to do a bit more error checking and string manipulation
 * on the user supplied format.
 *
 * @param {*} userFormat - user supplied format - defaults to empty string
 */
function validateFormat(userFormat = "") {
    if (!userFormat) throw new Error(errors.MISSING_FORMAT);

    const format = userFormat.toLowerCase().trim();

    if (!format) throw new Error(errors.MISSING_FORMAT);

    const officalFormat = allowedFormats[format];
    if (!officalFormat) throw new Error(errors.UNKNOWN_FORMAT);

    return officalFormat;
};

/**
 * Function that checks the legality of a deck
 *
 * @param {Object} deck - { mainboard: Array<Card>, sideboard?: Array<Card>, commandZone?: Array>Card> }
 * @param {String} format - game format
 *
 * @returns {{
 *  errors: Array<String>,
 *  warnings: Array<String>,
 * }}
 */
function validateLegality(deck, format) {
    const legalityChecker = formats[format];
    if (typeof legalityChecker !== "function") throw new Error(errors.UNKNOWN_LEGALITY_CHECKER);

    return legalityChecker(deck);
}

module.exports = {
    validateBoard,
    validateFormat,
    validateLegality,
};
