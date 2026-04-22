import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { Logger } from "pino";
import { verifyAccessToken } from "../lib/jwt.js";

export type AuthEnv = {
	Variables: {
		userId: string;
	};
};

type Env = { Variables: AuthEnv["Variables"] & { log: Logger } };

export const authGuard = createMiddleware<Env>(async (c, next) => {
	const header = c.req.header("Authorization");
	if (!header?.startsWith("Bearer ")) {
		throw new HTTPException(401, { message: "Missing or invalid token" });
	}

	try {
		const payload = verifyAccessToken(header.slice(7));
		c.set("userId", payload.sub);
		c.set("log", c.get("log").child({ userId: payload.sub }));
		await next();
	} catch {
		throw new HTTPException(401, { message: "Invalid or expired token" });
	}
});
