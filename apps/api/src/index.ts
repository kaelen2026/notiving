import "dotenv/config";
import { serve } from "@hono/node-server";
import { getEnv, initEnv } from "./config/env.js";
import { logger } from "./lib/logger.js";

initEnv(process.env);

const { default: createApp } = await import("./app.js");
const app = createApp();
const port = getEnv().PORT;

logger.info({ port }, "Server starting");

serve({ fetch: app.fetch, port });
