import app from "./app.js";
import { config } from "./config.js";

const server = app.listen(config.port, () => {
  console.log(`GPU Cloud API listening on port ${config.port} (${config.nodeEnv})`);
  console.log(`Workers: ${config.workerCount}, Rate limit: ${config.rateLimitRpm} rpm`);
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
