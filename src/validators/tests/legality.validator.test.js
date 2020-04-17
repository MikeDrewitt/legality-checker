
// Tested
const validator = require("../legality.validator");

// Constants
const errors = require("../../constants/errors.constants");
const { formats } = require("../../constants/formats.constants");

// Utils
const cardFactory = require("../../factories/card.factory");

describe("Legality Validator Tests", () => {
    let response;

    beforeEach(() => {
        response = null;
    });

    describe("Board Tests", () => {
        test("Returns board", () => {
            const deck = cardFactory.many(99);

            response = validator.validateBoard(deck);

            expect(deck).toEqual(response);
        });

        test("Error - if any non array is supplied", () => {
            const nonDeck = "Some non deck like object";

            try {
                response = validator.validateBoard(nonDeck);
                expect(true).toBeFalsy();
            } catch (err) {
                expect(err.message).toEqual(errors.BOARD_ERROR);
            }
        });
    });

    describe("Format Tests", () => {
        test.each([
            "commander", "edh"
        ])("Returns official format (%s)", format => {
            const officialFormat = validator.validateFormat(format);

            expect(officialFormat).toEqual(formats.COMMANDER);
        });

        test("Returns official format regardless of supplied case", () => {
            const officialFormat = validator.validateFormat("COMmaNder");

            expect(officialFormat).toEqual(formats.COMMANDER);
        });

        test.each([
            "", undefined, false, null
        ])("Error - if no format is supplied (%s)", falsyInput => {
            try {
                validator.validateFormat(falsyInput);
                expect(true).toBeFalsy();
            } catch (err) {
                expect(err.message).toEqual(errors.MISSING_FORMAT);
            }
        });

        test("Error - if unknown format is supplied", () => {
            try {
                validator.validateFormat("Non format name");
                expect(true).toBeFalsy(false);
            } catch (err) {
                expect(err.message).toEqual(errors.UNKNOWN_FORMAT);
            }
        });
    });

    describe("Legality Tests", () => {
        let deck;

        beforeEach(() => {
            deck = {
                mainboard: cardFactory.many(99),
                sideboard: [],
                commandZone: [],
            };
        });

        test("Returns legality checker response", () => {
            const legalityChecked = validator.validateLegality(deck, "commander");

            expect(Object.keys(legalityChecked)).toEqual([ "errors", "warnings" ]);
        });

        test("Error - if unknown format is supplied", () => {
            try {
                validator.validateLegality(deck, "Non format name");
                expect(true).toBeFalsy();
            } catch (err) {
                expect(err.message).toEqual(errors.UNKNOWN_LEGALITY_CHECKER);
            }
        });
    });
});
