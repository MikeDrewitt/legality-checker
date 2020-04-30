
// Tested Function
const validator = require("../brawl.validator");

// Constants
const errors = require("../../../constants/legality.constants");

// Utils
const cardFactory = require("../../../factories/card.factory");

// Rules
const exceptions = require("../../../rules/index.rules");

// Spies
const genericRules = require('../../../rules/generic.rules');

describe("Brawl Validator Tests", () => {

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

    test("Sideboard warning", () => {
        request.sideboard = [cardFactory.generate()];
        response = validator(request);

        expect(response.warnings.includes(errors.IGNORING_SIDEBOARD)).toBeTruthy();
    });

    describe("Command Zone Tests", () => {
        test("Error - throw error if commander isn't included in maybeboard", () => {
            const commander = cardFactory.generate();

            // Note we're only adding the commander to the commanZone, _not_ the mainboard here
            request.commandZone = [ commander ];

            try {
              response = validator(request);
              expect(false).toBeTruthy();
            } catch (err) {
              expect(err.message).toEqual(`${errors.COMMANDER_REQUIRED_IN_MAINBOARD} - ${commander.name}`);
            }
        });

        test("Error - Has multiple commanders", () => {
            const commanders = cardFactory.many(2);

            request.commandZone = commanders;
            request.mainboard = commanders;

            response = validator(request);

            expect(response.errors.includes(errors.SINGLE_COMMANDER)).toBeTruthy();
          });

        test("Error - Has more than one copy of commander", () => {
            const commander = cardFactory.generate({ quantity: 2 })

            request.commandZone = [ commander ];
            request.mainboard = [ commander ];

            response = validator(request);

            expect(response.errors.includes(`${errors.SINGLETON_FORMAT} - ${commander.name}`)).toBeTruthy();
        });

        test("Error - Is not legendary", () => {
            // Doesn't matter so long as it's not Legendary
            const commander = cardFactory.generate({ typeLine: "Basic" });

            request.commandZone = [ commander ];
            request.mainboard = [ commander ];

            response = validator(request);

            expect(response.errors.includes(`${errors.LEGENDARY_COMMANDER} - ${commander.name}`)).toBeTruthy();
        });

        test("Error - Is not creature || planeswalker", () => {
            // Doesn't matter so long as it's not a Creature || Planeswalker
            const commander = cardFactory.generate({ typeLine: "Artifact" });

            request.commandZone = [ commander ];
            request.mainboard = [ commander ];

            response = validator(request);

            expect(response.errors.includes(`${errors.CREATURE_COMMANDER} - ${commander.name}`)).toBeTruthy();
        });

        test("Error - illegal in brawl", () => {
            const commander = cardFactory.generate({ legalities: { brawl: 'illegal' } });

            request.commandZone = [ commander ];
            request.mainboard = [ commander ];

            response = validator(request);

            expect(response.errors.includes(`${errors.ILLEGAL_CARD} - ${commander.name}`)).toBeTruthy();
        });
    });

    describe("Mainboard Tests", () => {
        test("Error - illegal card in brawl", () => {
            const card = cardFactory.generate({ legalities: { brawl: 'illegal' } });

            request.mainboard = [ card ];

            response = validator(request);

            expect(response.errors.includes(`${errors.ILLEGAL_CARD} - ${card.name}`)).toBeTruthy();
          });

        test.each([0 , 8, 59])("Error - deck must have exactly 60 cards (testing %s)", deckQty => {
            const cards = cardFactory.many(deckQty);

            request.mainboard = cards;

            response = validator(request);

            expect(response.errors.includes(errors.BRAWL_EXPECTED_DECK_SIZE)).toBeTruthy();
        });

        test("Error - cards outside of commander color identity", () => {
            const commander = cardFactory.generate({ colorIdentity: [ "W", "U", "G" ] });
            const blackCard = cardFactory.generate({ colorIdentity: ["B"] });

            request.commandZone = [ commander ];
            request.mainboard = [ commander, blackCard ];

            response = validator(request);

            expect(response.errors.includes(`${errors.OUTSIDE_COLOR_IDENTITY} - ${blackCard.name}`)).toBeTruthy();
        });

        test.each([4, 44, 54])("Error - may only have one copy of each card (testing %s)", cardQty => {
            const card = cardFactory.generate({ quantity: cardQty });

            request.mainboard = [ card ];

            response = validator(request);

            expect(response.errors.includes(`${errors.SINGLETON_FORMAT} - ${card.name}`)).toBeTruthy();
        });

        test("Exception cards call to the mainboard exception handler", () => {
            const rulesSpy = jest.spyOn(genericRules, "mainboardRules");

            // We're gonna use our first alt commander as an example
            const anyNumberName = Object.keys(exceptions.unlimitedCopies)[0];
            const card = cardFactory.generate({ name: anyNumberName, legalities: { brawl: "legal" } });

            request.mainboard = [ card ];

            response = validator(request);

            expect(rulesSpy).toBeCalled();
            expect(rulesSpy.mock.calls[0][0]).toStrictEqual([ card ]);
          });
    });

});
