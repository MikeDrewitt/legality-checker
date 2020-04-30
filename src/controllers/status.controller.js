
const CardService = require('../services/card.service');

async function get(req, res, next) {
    try {
        res.status(200).send();
    } catch(err) {
        next(err);
    }
}

module.exports = {
  get,
};
