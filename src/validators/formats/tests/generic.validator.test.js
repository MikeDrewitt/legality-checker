
// Tested Function
const validator = require("../generic.validator");

// Constants
const legalityErrors = require("../../../constants/legality.constants");
const requestErrors = require("../../../constants/errors.constants");
const exceptions = require("../../../rules/index.rules");
const { formats } = require("../../../constants/formats.constants");

// Utils
const genericRules = require("../../../rules/generic.rules");
const cardFactory = require("../../../factories/card.factory")

describe("Generic Validator Tests", () => {
    let request;
    let response;
    let format;

    beforeEach(() => {
        response = null;
        request = {
            mainboard: [],
            sideboard: [],
            commandZone: [],
        };

        format = formats.STANDARD;
    });

    test("No cards in request returns expected response structure", () => {
        response = validator(request, format);

        expect(response.errors).toBeDefined();
        expect(response.warnings).toBeDefined();
    });

    test("Error - No format supplied", () => {
        try {
            // Missing format
            response = validator(request);
            expect(true).toBeFalsy();
        } catch (err) {
            expect(err.message).toEqual(requestErrors.MISSING_FORMAT);
        }
    });

    describe("Sideboard tests", () => {
        test.each([2, 14, 18])("Error - sideboard must have exactly 15 cards (%s cards)", quantity => {
            const sideboard = cardFactory.many(quantity);

            request.sideboard = sideboard;

            response = validator(request, format);

            expect(response.errors.includes(legalityErrors.SIDEBOARD_EXPECTED_SIZE)).toBeTruthy();
        });

        test("Error - sideboard and mainboard may only have up to 4 copies of any card", () => {
            // Because the quantity is 3, having 3 copies in the side and mainboard will result
            // in too many copies in the deck
            const card = cardFactory.generate({ quantity: 3 });

            request.sideboard = [ card ];
            request.mainboard = [ card ];

            response = validator(request, format);

            expect(response.errors.includes(`${legalityErrors.TOO_MANY_COPIES} - ${card.name}`)).toBeTruthy();
        });
    });

    describe("Mainboard tests", () => {
        test.each([1 , 59, 79])("Error - deck must have exactly 60 cards (testing %s)", deckQty => {
            const cards = cardFactory.many(deckQty);

            request.mainboard = cards;

            response = validator(request, format);

            expect(response.errors.includes(legalityErrors.EXPECTED_DECK_SIZE)).toBeTruthy();
        });

        test.each([5, 9, 22])("Error - may only have up to 4 copies of each card (testing %s)", cardQty => {
            const card = cardFactory.generate({ quantity: cardQty });

            request.mainboard = [ card ];

            response = validator(request, format);

            expect(response.errors.includes(`${legalityErrors.TOO_MANY_COPIES} - ${card.name}`)).toBeTruthy();
        });

        test.each([
            formats.STANDARD, formats.MODERN, formats.PAUPER
        ])("Error - illegal card in %s", dynamicFormat => {
            const card = cardFactory.generate();

            card.legalities[dynamicFormat] = 'illegal';

            request.mainboard = [ card ];

            response = validator(request, dynamicFormat);

            expect(response.errors.includes(`${legalityErrors.ILLEGAL_CARD} - ${card.name}`)).toBeTruthy();
        });

        test("Exception cards call to the mainboard exception handler", () => {
            const rulesSpy = jest.spyOn(genericRules, "mainboardRules");

            // We're gonna use our first alt commander as an example
            const anyNumberName = Object.keys(exceptions.unlimitedCopies)[0];
            const card = cardFactory.generate({ name: anyNumberName, legalities: { format: "legal" } });

            request.mainboard = [ card ];

            response = validator(request, format);

            expect(rulesSpy).toBeCalled();
            expect(rulesSpy.mock.calls[0][0]).toStrictEqual([ card ]);
        });
    })
});
