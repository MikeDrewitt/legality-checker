// Libraries
const router = require("express").Router();

// Controller
const { post } = require("../controllers/legality.controller");

router.post("/", post);

module.exports = router;
