// Libraries
const router = require("express").Router();

// Controller
const { get } = require("../controllers/status.controller");

router.get("/", get);

module.exports = router;
