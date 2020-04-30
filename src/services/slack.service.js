// Slack API Library
const { IncomingWebhook } = require('@slack/webhook');

// Constants
const config = require('../../config');

// Actual Slack webhook library
// https://slack.dev/node-slack-sdk/webhook - docs
const webhook = new IncomingWebhook(config.SLACK_WEBHOOK);

/**
 * If you're looking to make more complex notifications see - https://api.slack.com/tools/block-kit-builder
 * You can supply this function an object with an array of blocks to create fully customized messages
 *
 * @param {string | IncomingWebhookSendArguments} message
 */
function send(message) {

  if (typeof message === 'string') return webhook.send({ text: message });
  return webhook.send(...message);
}

module.exports = {
  send,
};
