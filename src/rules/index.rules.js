
const { altCommanders } = require("./altCommanders.rules");
const { partners } = require("./partners.rules");
const { unlimitedCopies } = require("./unlimitedCopies.rules");

const ruleBreakingCommanders = { ...altCommanders, ...partners };

module.exports = {
    ruleBreakingCommanders,
    unlimitedCopies,
};
