const routes = require("express").Router();

const legality = require("./legality.route");
const status = require("./status.route");

routes.use("/legality", legality);
routes.use("/status", status);

routes.use("/", (req, res, next) => {
  res.status(404).send("Archidekt Legality API - Not found");
});

module.exports = routes;
