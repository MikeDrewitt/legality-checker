// Testing
const rules = require("../generic.rules");

// Constants
const messages = require("../../constants/legality.constants");
const { unlimitedCopies } = require("../unlimitedCopies.rules");

// Utils
const Messages = require("../../utils/messages.utils");
const cardFactory = require("../../factories/card.factory");

describe("Generic Mainboard Exception Tests", () => {

    let errors;

    beforeEach(() => {
        errors = new Messages();
    });

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
