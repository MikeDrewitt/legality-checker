
const SlackService = require('../services/slack.service');

async function get(req, res, next) {
    try {
        res.status(200).send("Archidekt Legality API - Ok");
    } catch(err) {
        next(err);
    }
}

module.exports = {
  get,
};
