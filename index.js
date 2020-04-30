// Libraries
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Middleware
const routes = require("./src/routers/routes");
const errorHandler = require("./src/middleware/errorHandler.middleware");

// Env
// I know this isn't used here, but it's forcing dotenv to be required as early as possible in the app boot process
const config = require("./config");

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

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
