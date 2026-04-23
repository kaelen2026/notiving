import { createMiddleware } from "hono/factory";
import type { LoggerInstance } from "../lib/logger.js";
import { logger } from "../lib/logger.js";
import type { RequestIdEnv } from "./request-id.js";

export type RequestLoggerEnv = {
	Variables: {
		log: LoggerInstance;
	};
};

type Env = {
	Variables: RequestIdEnv["Variables"] & RequestLoggerEnv["Variables"];
};

export const requestLogger = createMiddleware<Env>(async (c, next) => {
	const log = logger.child({
		requestId: c.get("requestId"),
		method: c.req.method,
		path: c.req.path,
	});

	c.set("log", log);

	const start = performance.now();
	await next();
	const duration = Math.round(performance.now() - start);

	log.info({ status: c.res.status, duration }, "request completed");
});
