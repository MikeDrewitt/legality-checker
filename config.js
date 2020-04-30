require('dotenv').config()

module.exports = {
    SLACK_WEBHOOK: process.env.SLACK_WEBHOOK,
    NODE_ENV: process.env.NODE_ENV,
};
