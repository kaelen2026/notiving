import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { created, fail, ok } from "../../lib/api-response.js";
import { authGuard, tryExtractUserId } from "../../middleware/auth.js";
import type { AppEnv } from "../../types/env.js";
import { loginSchema, registerSchema } from "./auth.schema.js";
import * as authService from "./auth.service.js";

const REFRESH_TOKEN_COOKIE = "refresh_token";
const REFRESH_COOKIE_OPTIONS = {
	path: "/api/v1/auth",
	httpOnly: true,
	secure: true,
	sameSite: "Strict" as const,
	maxAge: 7 * 24 * 60 * 60,
};

export const authRoute = new Hono<AppEnv>();

function isWeb(c: { get: (key: "deviceType") => string }) {
	return c.get("deviceType") === "web";
}

authRoute.post("/register", zValidator("json", registerSchema), async (c) => {
	const input = c.req.valid("json");
	const anonymousUserId =
		tryExtractUserId(c.req.header("Authorization")) ?? undefined;
	const result = await authService.register(input, anonymousUserId);
	c.get("log").info({ userId: result.user.id }, "user registered");

	if (isWeb(c)) {
		setCookie(
			c,
			REFRESH_TOKEN_COOKIE,
			result.refreshToken,
			REFRESH_COOKIE_OPTIONS,
		);
		const { refreshToken: _, ...rest } = result;
		return created(c, rest);
	}

	return created(c, result);
});

authRoute.post("/login", zValidator("json", loginSchema), async (c) => {
	const input = c.req.valid("json");
	const result = await authService.login(input);
	if (!result) {
		c.get("log").warn("login failed");
		return fail(c, "Invalid email or password", 401);
	}

	c.get("log").info({ userId: result.user.id }, "user logged in");

	if (isWeb(c)) {
		setCookie(
			c,
			REFRESH_TOKEN_COOKIE,
			result.refreshToken,
			REFRESH_COOKIE_OPTIONS,
		);
		const { refreshToken: _, ...rest } = result;
		return ok(c, rest);
	}

	return ok(c, result);
});

authRoute.post("/refresh", async (c) => {
	let refreshToken: string | undefined;

	if (isWeb(c)) {
		refreshToken = getCookie(c, REFRESH_TOKEN_COOKIE);
	} else {
		const body = await c.req.json().catch(() => ({}));
		refreshToken = body.refreshToken;
	}

	if (!refreshToken) {
		return fail(c, "Missing refresh token", 401);
	}

	try {
		const result = await authService.refresh(refreshToken);
		if (!result) {
			if (isWeb(c)) {
				deleteCookie(c, REFRESH_TOKEN_COOKIE, { path: "/api/v1/auth" });
			}
			return fail(c, "Invalid refresh token", 401);
		}

		if (isWeb(c)) {
			setCookie(
				c,
				REFRESH_TOKEN_COOKIE,
				result.refreshToken,
				REFRESH_COOKIE_OPTIONS,
			);
			const { refreshToken: _, ...rest } = result;
			return ok(c, rest);
		}

		return ok(c, result);
	} catch {
		if (isWeb(c)) {
			deleteCookie(c, REFRESH_TOKEN_COOKIE, { path: "/api/v1/auth" });
		}
		return fail(c, "Invalid or expired refresh token", 401);
	}
});

authRoute.post("/logout", authGuard, async (c) => {
	const userId = c.get("userId");
	await authService.logout(userId);
	c.get("log").info("user logged out");

	if (isWeb(c)) {
		deleteCookie(c, REFRESH_TOKEN_COOKIE, { path: "/api/v1/auth" });
	}

	return ok(c, { message: "Logged out" });
});

authRoute.get("/me", authGuard, async (c) => {
	const userId = c.get("userId");
	const user = await authService.getMe(userId);
	if (!user) {
		return fail(c, "User not found", 404);
	}
	return ok(c, user);
});
