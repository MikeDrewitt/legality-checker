
// Libraries
const faker = require("faker");

function generate(card = {}) {
  return {
    name: card.name || faker.name.findName(),
    cmc: card.cmc || faker.random.number(16),
    manaCost: card.manaCost || '', // TODO - casting cost based on cmc
    oracleText: card.oracleText || faker.lorem.paragraph(),
    colors: card.colors || '',
    colorIdentity: card.colorIdentity || [], // TODO
    typeLine: card.typeLine || '', // TODO -
    legalities: card.legalities || {}, // TODO - more,
    quantity: card.quantity || 1, // TODO
  };
};

function many(qty = 1, card = {}) {
  const cards = [];

  for (let i = 0; i < qty; i++) cards.push(generate(card));

  return cards;
};

module.exports = {
  generate,
  many,
};
