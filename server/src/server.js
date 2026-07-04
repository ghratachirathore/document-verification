import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { env, validateEnvironment } from "./config/env.js";
import { logger } from "./utils/logger.js";

const runtimeModes = validateEnvironment();
logger.info("EduVerify AI runtime modes", runtimeModes);

connectDB()
  .then(() => {
    app.listen(env.port, () => {
      logger.info(`EduVerify AI server running on http://localhost:${env.port}`);
    });
  })
  .catch((error) => {
    logger.error("Failed to start server", error);
    process.exit(1);
  });
