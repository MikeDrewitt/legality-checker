// Tested Function
const validator = require("../oathbreaker.validator");

// Constants
const errors = require("../../../constants/legality.constants");
const exceptions = require("../../../rules/index.rules");

// Utils
const cardFactory = require("../../../factories/card.factory");

// Spies
const genericRules = require('../../../rules/generic.rules');
const oathbreakerRules = require('../../../rules/oathbreaker.rules');
describe("Oathbreaker Validator Tests", () => {

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
              expect(err.message).toEqual(`${errors.COMMANDER_SIG_SPELL_REQUIRED_IN_MAINBOARD} - ${commander.name}`);
            }
        });

        test("Error - Has more than one commander and one signiture spell", () => {
            const commanders = cardFactory.many(3);

            request.commandZone = commanders;
            request.mainboard = commanders;

            response = validator(request);

            expect(response.errors.includes(errors.SINGLE_OATHBREAKER_AND_SIG_SPELL)).toBeTruthy();
          });

        test("Error - Has more than one copy of commander/ signature spell", () => {
            const commander = cardFactory.generate({ quantity: 2 })

            request.commandZone = [ commander ];
            request.mainboard = [ commander ];

            response = validator(request);

            expect(response.errors.includes(`${errors.SINGLETON_FORMAT} - ${commander.name}`)).toBeTruthy();
        });

        test("Error - Not allowed card type", () => {
            // Doesn't matter so long as it's not a Planeswalker
            const commander = cardFactory.generate({ typeLine: "Creature" });
            const signatureSpell = cardFactory.generate({ typeLine: "Instant" });

            request.commandZone = [ commander, signatureSpell ];
            request.mainboard = [ commander, signatureSpell ];

            response = validator(request);

            expect(response.errors.includes(`${errors.OATHBREAKER_NOT_ALLOWED} - ${commander.name}`)).toBeTruthy();
        });

        test("Error - Missing oathbreaker", () => {
             // Doesn't matter so long as it's not a Planeswalker
             const commander = cardFactory.generate({ typeLine: "Creature" });
             const signatureSpell = cardFactory.generate({ typeLine: "Instant" });

             request.commandZone = [ commander, signatureSpell ];
             request.mainboard = [ commander, signatureSpell ];

             response = validator(request);

             expect(response.errors.includes(errors.MISSING_OATHBREAKER)).toBeTruthy();
        });

        test("Error - Missing signiture spell", () => {
            const commander = cardFactory.generate({ typeLine: "Planeswalker" });
            // Doesn't matter so long as it's not a Spell
            const signatureSpell = cardFactory.generate({ typeLine: "Enchantment" });

            request.commandZone = [ commander, signatureSpell ];
            request.mainboard = [ commander, signatureSpell ];

            response = validator(request);

            expect(response.errors.includes(errors.MISSING_SIGNITURE_SPELL)).toBeTruthy();
       });

        test("Error - illegal in oathbreaker", () => {
            const commander = cardFactory.generate({ legalities: { oathbreaker: 'illegal' } });

            request.commandZone = [ commander ];
            request.mainboard = [ commander ];

            response = validator(request);

            expect(response.errors.includes(`${errors.ILLEGAL_CARD} - ${commander.name}`)).toBeTruthy();
        });
    });

    describe("Mainboard Tests", () => {
        test("Error - illegal card in oathbreaker", () => {
            const card = cardFactory.generate({ legalities: { oathbreaker: 'illegal' } });

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

        test("Error - cards outside of oathbreaker color identity", () => {
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
