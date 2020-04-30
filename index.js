// Libraries
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cron = require("node-cron");

// Middleware
const routes = require("./src/routers/routes");
const errorHandler = require("./src/middleware/errorHandler.middleware");

// Environment & Services
// I know this isn't used here, but it's forcing dotenv to be required as early as possible in the app boot process
const config = require("./config");
const CardService = require("./src/services/card.service");

// Initial Setup of local card map
CardService.fetchCards()
  .then(() => console.log("Setup local card DB"));

cron.schedule("0 3 * * *", CardService.fetchCards);

const app = express();

// Libraries
app.use(helmet());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("combined"));

// Middleware
app.use("/", routes);
app.use(errorHandler);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on port ${port}`));
