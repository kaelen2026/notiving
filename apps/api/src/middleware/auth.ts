import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { verifyAccessToken } from "../lib/jwt.js";
import type { LoggerInstance } from "../lib/logger.js";
import { findUserIsAnonymous } from "../modules/auth/auth.repository.js";

export type AuthEnv = {
	Variables: {
		userId: string;
	};
};

type Env = { Variables: AuthEnv["Variables"] & { log: LoggerInstance } };

export const authGuard = createMiddleware<Env>(async (c, next) => {
	const header = c.req.header("Authorization");
	if (!header?.startsWith("Bearer ")) {
		throw new HTTPException(401, { message: "Missing or invalid token" });
	}

	try {
		const payload = await verifyAccessToken(header.slice(7));
		c.set("userId", payload.sub);
		c.set("log", c.get("log").child({ userId: payload.sub }));
		await next();
	} catch {
		throw new HTTPException(401, { message: "Invalid or expired token" });
	}
});

export async function tryExtractUserId(
	header: string | undefined,
): Promise<string | null> {
	if (!header?.startsWith("Bearer ")) return null;
	try {
		const payload = await verifyAccessToken(header.slice(7));
		return payload.sub;
	} catch {
		return null;
	}
}

export const registeredGuard = createMiddleware<Env>(async (c, next) => {
	const userId = c.get("userId");
	const user = await findUserIsAnonymous(userId);

	if (!user || user.isAnonymous) {
		throw new HTTPException(403, { message: "Registration required" });
	}

	await next();
});
