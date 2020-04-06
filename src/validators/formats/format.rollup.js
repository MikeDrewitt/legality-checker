
// Constants
const brawl = require("./brawl.validator");
const commander = require("./commander.validator");
const oathbreaker = require("./oathbreaker.validator");
const vintage = require("./vintage.validator");
const generic = require("./generic.validator");

// These names need to line up with the fomats listed in `formats.constants.js`
// The reason for this is such that these can be pulled up with the validated format name
module.exports = {
    brawl,
    commander,
    oathbreaker,
    vintage,
    pauper: generic,
    standard: generic,
    modern: generic,
    legacy: generic,
};
