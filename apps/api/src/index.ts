import "dotenv/config";
import { serve } from "@hono/node-server";
import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";

const port = env.PORT;

logger.info({ port }, "Server starting");

serve({ fetch: app.fetch, port });
