const http = require("http");
const mongoose = require("mongoose");
const app = require("./app");
const env = require("./config/env");
const connectDB = require("./config/db");

async function startServer() {
  await connectDB();

  const server = http.createServer(app);

  server.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${env.port}`);
  });

  const shutdown = async (signal) => {
    // eslint-disable-next-line no-console
    console.log(`Received ${signal}. Shutting down gracefully...`);

    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", error);
  process.exit(1);
});
