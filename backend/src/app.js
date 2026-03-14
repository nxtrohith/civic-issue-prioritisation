const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const env = require("./config/env");
const routes = require("./routes");

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin === "*" ? true : env.corsOrigin.split(",") }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = env.nodeEnv === "production" && statusCode === 500 ? "Internal server error" : err.message;

  res.status(statusCode).json({ message });
});

module.exports = app;
