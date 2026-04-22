import { createMiddleware } from "hono/factory";

export type RequestIdEnv = {
	Variables: {
		requestId: string;
	};
};

export const requestId = createMiddleware<RequestIdEnv>(async (c, next) => {
	const id = c.req.header("X-Request-ID") || crypto.randomUUID();
	c.set("requestId", id);
	c.header("X-Request-ID", id);
	await next();
});
