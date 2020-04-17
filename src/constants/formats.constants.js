
const formats = {
    COMMANDER: "commander",
    BRAWL: "brawl",
    OATHBREAKER: "oathbreaker",
    STANDARD: "standard",
    MODERN: "modern",
    VINTAGE: "vintage",
    LEGACY: "legacy",
    PAUPER: "pauper",
}

// List of all allowed format names
// All of these are gonna be lower case, when looking them up you should look them up as such
// We're gonna allow multilpes of format names, such that we can allow users to supply multiple names for a format
const allowedFormats = {
    // EDH
    commander: formats.COMMANDER,
    edh: formats.COMMANDER,

    // Formats with one name
    brawl: formats.BRAWL,
    oathbreaker: formats.OATHBREAKER,
    standard: formats.STANDARD,
    modern: formats.MODERN,
    vintage: formats.VINTAGE,
    legacy: formats.LEGACY,
    pauper: formats.PAUPER,
};

const commandZoneFormats = [
    formats.COMMANDER,
    formats.BRAWL,
    formats.OATHBREAKER,
];

const sideboardFormats = [
    formats.STANDARD,
    formats.PAUPER,
    formats.MODERN,
    formats.VINTAGE,
    formats.LEGACY,
];

module.exports = {
    formats,

    allowedFormats,
    commandZoneFormats,
    sideboardFormats,
};
