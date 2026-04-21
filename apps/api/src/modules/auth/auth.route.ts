import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { created, fail, ok } from "../../lib/api-response.js";
import { type AuthEnv, authGuard } from "../../middleware/auth.js";
import * as handler from "./auth.handler.js";
import { loginSchema, refreshSchema, registerSchema } from "./auth.schema.js";

export const authRoute = new Hono<AuthEnv>();

authRoute.post("/register", zValidator("json", registerSchema), async (c) => {
	const input = c.req.valid("json");
	const result = await handler.register(input);
	return created(c, result);
});

authRoute.post("/login", zValidator("json", loginSchema), async (c) => {
	const input = c.req.valid("json");
	const result = await handler.login(input);
	if (!result) {
		return fail(c, "Invalid email or password", 401);
	}
	return ok(c, result);
});

authRoute.post("/refresh", zValidator("json", refreshSchema), async (c) => {
	const { refreshToken } = c.req.valid("json");
	try {
		const result = await handler.refresh(refreshToken);
		if (!result) {
			return fail(c, "Invalid refresh token", 401);
		}
		return ok(c, result);
	} catch {
		return fail(c, "Invalid or expired refresh token", 401);
	}
});

authRoute.get("/me", authGuard, async (c) => {
	const userId = c.get("userId");
	const user = await handler.getMe(userId);
	if (!user) {
		return fail(c, "User not found", 404);
	}
	return ok(c, user);
});
