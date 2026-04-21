import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

interface RateLimitOptions {
	windowMs: number;
	max: number;
}

export function rateLimiter({ windowMs, max }: RateLimitOptions) {
	const store = new Map<string, RateLimitEntry>();

	setInterval(() => {
		const now = Date.now();
		for (const [key, entry] of store) {
			if (entry.resetAt <= now) {
				store.delete(key);
			}
		}
	}, windowMs);

	return createMiddleware(async (c, next) => {
		const key =
			c.req.header("x-forwarded-for") ??
			c.req.header("x-real-ip") ??
			"unknown";
		const now = Date.now();
		const entry = store.get(key);

		if (!entry || entry.resetAt <= now) {
			store.set(key, { count: 1, resetAt: now + windowMs });
			await next();
			return;
		}

		entry.count += 1;

		if (entry.count > max) {
			throw new HTTPException(429, { message: "Too many requests" });
		}

		await next();
	});
}
