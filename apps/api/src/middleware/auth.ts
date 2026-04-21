import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { verifyAccessToken } from "../lib/jwt.js";

export type AuthEnv = {
	Variables: {
		userId: string;
	};
};

export const authGuard = createMiddleware<AuthEnv>(async (c, next) => {
	const header = c.req.header("Authorization");
	if (!header?.startsWith("Bearer ")) {
		throw new HTTPException(401, { message: "Missing or invalid token" });
	}

	try {
		const payload = verifyAccessToken(header.slice(7));
		c.set("userId", payload.sub);
		await next();
	} catch {
		throw new HTTPException(401, { message: "Invalid or expired token" });
	}
});
