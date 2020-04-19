
// Tested Function
const validator = require("../vintage.validator");

// Constants
const errors = require("../../../constants/legality.constants");
const exceptions = require("../../../rules/index.rules");

// Utils
const cardFactory = require("../../../factories/card.factory");

describe("Vintage Validator Tests", () => {

    let request;
    let response;

    beforeEach(() => {
        response = null;
        request = {
            mainboard: [],
            sideboard: [],
            commandZone: [],
        };
    });

    test("No cards in request returns expected response structure", () => {
        response = validator(request);

        expect(response.errors).toBeDefined();
        expect(response.warnings).toBeDefined();
    });

    describe("Sideboard tests", () => {
        test.each([2, 14, 18])("Error - sideboard must have exactly 15 cards (%s cards)", quantity => {
            const sideboard = cardFactory.many(quantity);

            request.sideboard = sideboard;

            response = validator(request);

            expect(response.errors.includes(errors.SIDEBOARD_EXPECTED_SIZE)).toBeTruthy();
        });

        test("Error - sideboard and mainboard may only have up to 4 copies of any card", () => {
            // Because the quantity is 3, having 3 copies in the side and mainboard will result
            // in too many copies in the deck
            const card = cardFactory.generate({ quantity: 3 });

            request.sideboard = [ card ];
            request.mainboard = [ card ];

            response = validator(request);

            expect(response.errors.includes(`${errors.TOO_MANY_COPIES} - ${card.name}`)).toBeTruthy();
        });

        test("Error - sideboard and maybeboard may only have 1 copy of a restricted card", () => {
            // Putting one copy in sideboard and one in maybeboard
            const card = cardFactory.generate({ quantity: 1, legalities: { vintage: "restricted" } });

            request.sideboard = [ card ];
            request.mainboard = [ card ];

            response = validator(request);

            expect(response.errors.includes(`${errors.VINTAGE_RESTRICTED} - ${card.name}`)).toBeTruthy();
        });
    });

    describe("Mainboard tests", () => {
        test.each([1 , 59, 79])("Error - deck must have exactly 60 cards (testing %s)", deckQty => {
            const cards = cardFactory.many(deckQty);

            request.mainboard = cards;

            response = validator(request);

            expect(response.errors.includes(errors.EDH_EXPECTED_DECK_SIZE)).toBeTruthy();
        });

        test.each([5, 9, 22])("Error - may only have up to 4 copies of each card (testing %s)", cardQty => {
            const card = cardFactory.generate({ qty: cardQty });

            request.mainboard = [ card ];

            response = validator(request);

            expect(response.errors.includes(`${errors.SINGLETON_FORMAT} - ${card.name}`)).toBeTruthy();
        });

        test("Error - deck may only have 1 copy of a restricted card", () => {
            // Quantity > 1 on restricted card
            const card = cardFactory.generate({ quantity: 2, legalities: { vintage: "restricted" } });

            request.mainboard = [ card ];

            response = validator(request);

            expect(response.errors.includes(`${errors.VINTAGE_RESTRICTED} - ${card.name}`)).toBeTruthy();
        });

        test("Error - illegal card in vintage", () => {
            const card = cardFactory.generate({ legalities: { vintage: 'illegal' } });

            request.mainboard = [ card ];

            response = validator(request);

            expect(response.errors.includes(`${errors.ILLEGAL_CARD} - ${card.name}`)).toBeTruthy();
        });

        test("Exception cards call to the mainboard exception handler", () => {
            const rulesSpy = jest.spyOn(genericRules, "mainboardRules");

            // We're gonna use our first alt commander as an example
            const anyNumberName = Object.keys(exceptions.unlimitedCopies)[0];
            const card = cardFactory.generate({ name: anyNumberName, legalities: { vintage: "legal" } });

            request.mainboard = [ card ];

            response = validator(request);

            expect(rulesSpy).toBeCalled();
            expect(rulesSpy.mock.calls[0][0]).toStrictEqual([ card ]);
        });
    });
});
