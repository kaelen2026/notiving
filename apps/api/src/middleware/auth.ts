import { eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { Logger } from "pino";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
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

export function tryExtractUserId(header: string | undefined): string | null {
	if (!header?.startsWith("Bearer ")) return null;
	try {
		const payload = verifyAccessToken(header.slice(7));
		return payload.sub;
	} catch {
		return null;
	}
}

export const registeredGuard = createMiddleware<Env>(async (c, next) => {
	const userId = c.get("userId");
	const [user] = await db
		.select({ isAnonymous: users.isAnonymous })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!user || user.isAnonymous) {
		throw new HTTPException(403, { message: "Registration required" });
	}

	await next();
});
