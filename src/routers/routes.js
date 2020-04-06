const routes = require("express").Router();

const legality = require("./legality.route");

routes.use("/legality", legality);
routes.use("/", (req, res, next) => {
  res.status(404).send("Legality - Bad request");
});

module.exports = routes;
