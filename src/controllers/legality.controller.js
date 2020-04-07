
// Utils
const { fetchCards } = require("../utils/cardLookup.util");
const { validateBoard, validateFormat, validateLegality } = require("../validators/legality.validator");

async function post(req, res, next) {
  const { body } = req;
  const { mainboard, sideboard, commandZone, format } = body;

  try {

    const validatedFormat = validateFormat(format);

    const validatedMainboard = validateBoard(mainboard);
    const validatedCommandZone = validateBoard(commandZone);
    const validatedSideboard = validateBoard(sideboard);

    const [ mainboardCards, sideboardCards, commandZoneCards ] = await Promise.all([
      fetchCards(validatedMainboard),
      fetchCards(validatedSideboard),
      fetchCards(validatedCommandZone),
    ]);

    const { errors, warnings } = validateLegality(
      { mainboard: mainboardCards, sideboard: sideboardCards, commandZone: commandZoneCards },
      validatedFormat
    );

    res.status(200).send({
      legal: !errors.length,
      errors,
      warnings,
    });

  } catch(err) {
    next(err);
  }
}

module.exports = {
  post,
};
