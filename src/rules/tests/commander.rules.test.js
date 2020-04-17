
// Testing
const rules = require("../commander.rules");

// Constants
const messages = require("../../constants/legality.constants");
const { altCommanders } = require("../altCommanders.rules");
const { partners } = require("../partners.rules");
const { unlimitedCopies } = require("../unlimitedCopies.rules");

// Utils
const Messages = require("../../utils/messages.utils");
const cardFactory = require("../../factories/card.factory");

describe("Commander Exception Tests", () => {

    let errors;

    beforeEach(() => {
        errors = new Messages();
    });

    describe("Command Zone Tests", () => {
        test("Two partner returns no errors", () => {
            const commanders = cardFactory.many(2, { oracleText: "Partner" });

            rules.commanderRules(commanders, errors);

            expect(errors.data.length).toEqual(0);
        });

        test("Partner with", () => {
            const cardNameOne = "Name One";
            const cardNameTwo = "Name Two";

            const commander = cardFactory.generate({ name: cardNameOne, oracleText: `Partner with ${cardNameTwo}` });
            const partner = cardFactory.generate({ name: cardNameTwo, oracleText: `Partner with ${cardNameOne}` });

            rules.commanderRules([ commander, partner ], errors);

            expect(errors.data.length).toEqual(0);
        });

        test("Planeswalkers as commander", () => {
            // Just gonna taka a generic name from this list.
            const planeswalkerName = Object.keys(altCommanders)[0];
            const commander = cardFactory.generate({ name: planeswalkerName });

            rules.commanderRules([ commander ], errors);

            expect(errors.data.length).toEqual(0);
        });

        test("Only one partner", () => {
            const partnerName = Object.keys(partners)[0]
            const commander = cardFactory.generate({ name: partnerName, oracleText: "Partner" });

            rules.commanderRules([ commander ], errors);

            expect(errors.data.length).toEqual(0);
        });

        test("Error - Too many exceptions", () => {
            const commanders = cardFactory.many(3);

            rules.commanderRules(commanders, errors);

            expect(errors.data.includes(messages.TOO_MANY_COMMANDERS)).toBeTruthy();
        });

        test.each([
            { firstCard: "Partner", secondCard: "Something Else" },
            { firstCard: "Something Else", secondCard: "Partner" }
        ])("Error - Partner and non partner %s", cardNames => {
            const commander = cardFactory.generate({ oracleText: cardNames.firstCard });
            const partner = cardFactory.generate({ oracleText: cardNames.secondCard });

            rules.commanderRules([ commander, partner ], errors);

            expect(errors.data.includes(messages.TOO_MANY_COMMANDERS));
        });

        test.each([
            { firstCard: "Partner with", secondCard: "Generic oracle text" },
            { firstCard: "Generic oracle text", secondCard: "Partner with" }
        ])("Error - Parter with and non partner with %s", cardData => {
            const commander = cardFactory.generate({ oracleText: cardData.firstCard });
            const partner = cardFactory.generate({ oracleText: cardData.secondCard });

            rules.commanderRules([ commander, partner ], errors);

            expect(errors.data.includes(messages.TOO_MANY_COMMANDERS)).toBeTruthy();
        });

        test("Error - Non matching partner withs", () => {
            const commander = cardFactory.generate({ oracleText: "Partner with not Card Two" });
            const partner = cardFactory.generate({ oracleText: "Partner with not Card One" });

            rules.commanderRules([ commander, partner ], errors);

            expect(errors.data.includes(messages.TOO_MANY_COMMANDERS)).toBeTruthy();
        });

        test("Multiple alternate commanders", () => {
            // Just gonna taka a generic name from this list.
            const commanderName = Object.keys(altCommanders)[0];
            const partnerName = Object.keys(altCommanders)[1];

            const commander = cardFactory.generate({ name: commanderName });
            const partner = cardFactory.generate({ name: partnerName });

            rules.commanderRules([ commander, partner ], errors);

            expect(errors.data.includes(messages.TOO_MANY_COMMANDERS)).toBeTruthy();
        });

    });

    describe("Mainboard Tests", () => {
        test.each([
            "Island", "Snow-Covered Forest", "Wastes"
        ])("Basic lands (%s)", cardName => {
            const basic = cardFactory.generate({ name: cardName, quantity: 8 });

            rules.mainboardRules([ basic ], errors);

            expect(errors.data.length).toBeFalsy();
        });

        test("Unlimited copies", () => {
            const unlimitedCardName = Object.keys(unlimitedCopies)[0];
            const unlimitedCard = cardFactory.generate({ name: unlimitedCardName, quantity: 8 });

            rules.mainboardRules([ unlimitedCard ], errors);

            expect(errors.data.length).toBeFalsy();
        });

        test("Seven dwarves", () => {
            const dwarves = cardFactory.generate({ name: "Seven Dwarves", quantity: 7 });

            rules.mainboardRules([ dwarves ], errors);

            expect(errors.data.length).toBeFalsy();
        });

        test("Error - Greater than seven dwarves", () => {
            const dwarves = cardFactory.generate({ name: "Seven Dwarves", quantity: 8 });

            rules.mainboardRules([ dwarves ], errors);

            expect(errors.data.includes(messages.SEVEN_DWARVES)).toBeTruthy();
        });
    });
});
