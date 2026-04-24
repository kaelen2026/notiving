import { zValidator } from "@hono/zod-validator";
import * as arctic from "arctic";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { created, fail, ok } from "../../lib/api-response.js";
import {
	getAppleAuthorizationUrl,
	handleAppleCallback,
} from "../../lib/oauth/apple.js";
import type { OAuthProfile } from "../../lib/oauth/google.js";
import {
	getGoogleAuthorizationUrl,
	handleGoogleAccessToken,
	handleGoogleCallback,
} from "../../lib/oauth/google.js";
import { isOAuthProvider } from "../../lib/oauth/providers.js";
import { consumeOAuthState, createOAuthState } from "../../lib/oauth/state.js";
import { authGuard, tryExtractUserId } from "../../middleware/auth.js";
import type { AppEnv } from "../../types/env.js";
import * as authService from "./auth.service.js";
import {
	isWeb,
	REFRESH_COOKIE_OPTIONS,
	REFRESH_TOKEN_COOKIE,
} from "./auth.utils.js";
import {
	linkPasswordBody,
	oauthInitiateQuery,
	oauthNativeTokenBody,
	oauthTokenBody,
} from "./oauth.schema.js";
import * as oauthService from "./oauth.service.js";

export const oauthRoute = new Hono<AppEnv>();

oauthRoute.post("/anonymous", async (c) => {
	const result = await authService.createAnonymousUser();
	c.get("log").info({ userId: result.user.id }, "anonymous user created");

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

oauthRoute.get(
	"/oauth/:provider",
	zValidator("query", oauthInitiateQuery),
	async (c) => {
		const provider = c.req.param("provider");
		if (!isOAuthProvider(provider)) {
			return fail(c, "Unsupported provider", 400);
		}

		const deviceType = c.get("deviceType");
		const { redirect_uri: redirectUri } = c.req.valid("query");

		if (provider === "google") {
			const codeVerifier = arctic.generateCodeVerifier();
			const state = await createOAuthState({
				provider,
				deviceType,
				codeVerifier,
				redirectUri,
			});
			const url = await getGoogleAuthorizationUrl(state, codeVerifier);

			if (isWeb(c)) {
				return c.redirect(url.toString());
			}
			return ok(c, { authorizationUrl: url.toString() });
		}

		const nonce = arctic.generateState();
		const state = await createOAuthState({
			provider,
			deviceType,
			nonce,
			redirectUri,
		});
		const url = await getAppleAuthorizationUrl(state, nonce);

		if (isWeb(c)) {
			return c.redirect(url.toString());
		}
		return ok(c, { authorizationUrl: url.toString() });
	},
);

oauthRoute.get("/oauth/:provider/callback", async (c) => {
	const provider = c.req.param("provider");
	if (!isOAuthProvider(provider)) {
		return fail(c, "Unsupported provider", 400);
	}

	const code = c.req.query("code");
	const stateParam = c.req.query("state");

	if (!code || !stateParam) {
		return fail(c, "Missing code or state", 400);
	}

	const stored = await consumeOAuthState(stateParam);
	if (!stored) {
		return fail(c, "Invalid or expired state", 400);
	}

	const anonymousUserId =
		(await tryExtractUserId(c.req.header("Authorization"))) ?? undefined;

	let profile: OAuthProfile;
	if (provider === "google") {
		if (!stored.codeVerifier) {
			return fail(c, "Missing code verifier for Google OAuth", 400);
		}
		profile = await handleGoogleCallback(code, stored.codeVerifier);
	} else {
		profile = await handleAppleCallback(code);
	}

	const result = await oauthService.handleOAuthUser(profile, anonymousUserId);
	c.get("log").info({ userId: result.user.id, provider }, "oauth login");

	if (stored.deviceType === "web") {
		setCookie(
			c,
			REFRESH_TOKEN_COOKIE,
			result.refreshToken,
			REFRESH_COOKIE_OPTIONS,
		);
		const redirectUrl = new URL(
			stored.redirectUri || "/auth/callback",
			c.req.url,
		);
		redirectUrl.searchParams.set("accessToken", result.accessToken);
		return c.redirect(redirectUrl.toString());
	}

	if (stored.redirectUri) {
		const redirectUrl = new URL(stored.redirectUri);
		redirectUrl.searchParams.set("accessToken", result.accessToken);
		redirectUrl.searchParams.set("refreshToken", result.refreshToken);
		return c.redirect(redirectUrl.toString());
	}

	return ok(c, result);
});

oauthRoute.post("/oauth/:provider/callback", async (c) => {
	const provider = c.req.param("provider");
	if (!isOAuthProvider(provider)) {
		return fail(c, "Unsupported provider", 400);
	}

	const body = await c.req.parseBody();
	const code = body.code as string | undefined;
	const stateParam = body.state as string | undefined;

	if (!code || !stateParam) {
		return fail(c, "Missing code or state", 400);
	}

	const stored = await consumeOAuthState(stateParam);
	if (!stored) {
		return fail(c, "Invalid or expired state", 400);
	}

	const anonymousUserId =
		(await tryExtractUserId(c.req.header("Authorization"))) ?? undefined;

	let profile: OAuthProfile;
	if (provider === "apple") {
		const userJson = body.user as string | undefined;
		let firstName: string | undefined;
		let lastName: string | undefined;
		if (userJson) {
			try {
				const parsed = JSON.parse(userJson) as {
					name?: { firstName?: string; lastName?: string };
				};
				firstName = parsed.name?.firstName;
				lastName = parsed.name?.lastName;
			} catch {
				// Apple user JSON parse failed — proceed without name
			}
		}
		profile = await handleAppleCallback(code, firstName, lastName);
	} else {
		if (!stored.codeVerifier) {
			return fail(c, "Missing code verifier for Google OAuth", 400);
		}
		profile = await handleGoogleCallback(code, stored.codeVerifier);
	}

	const result = await oauthService.handleOAuthUser(profile, anonymousUserId);
	c.get("log").info(
		{ userId: result.user.id, provider },
		"oauth login (POST callback)",
	);

	if (stored.deviceType === "web") {
		setCookie(
			c,
			REFRESH_TOKEN_COOKIE,
			result.refreshToken,
			REFRESH_COOKIE_OPTIONS,
		);
		const redirectUrl = new URL(
			stored.redirectUri || "/auth/callback",
			c.req.url,
		);
		redirectUrl.searchParams.set("accessToken", result.accessToken);
		return c.redirect(redirectUrl.toString());
	}

	if (stored.redirectUri) {
		const redirectUrl = new URL(stored.redirectUri);
		redirectUrl.searchParams.set("accessToken", result.accessToken);
		redirectUrl.searchParams.set("refreshToken", result.refreshToken);
		return c.redirect(redirectUrl.toString());
	}

	return ok(c, result);
});

oauthRoute.post(
	"/oauth/google/native-token",
	zValidator("json", oauthNativeTokenBody),
	async (c) => {
		const { accessToken } = c.req.valid("json");
		const anonymousUserId =
			(await tryExtractUserId(c.req.header("Authorization"))) ?? undefined;

		const profile = await handleGoogleAccessToken(accessToken);
		const result = await oauthService.handleOAuthUser(profile, anonymousUserId);
		c.get("log").info(
			{ userId: result.user.id, provider: "google" },
			"google native token login",
		);

		return ok(c, result);
	},
);

oauthRoute.post(
	"/oauth/:provider/token",
	zValidator("json", oauthTokenBody),
	async (c) => {
		const provider = c.req.param("provider");
		if (!isOAuthProvider(provider)) {
			return fail(c, "Unsupported provider", 400);
		}

		const { code, codeVerifier, user } = c.req.valid("json");
		const anonymousUserId =
			(await tryExtractUserId(c.req.header("Authorization"))) ?? undefined;

		let profile: OAuthProfile;
		if (provider === "google") {
			if (!codeVerifier) {
				return fail(c, "Missing codeVerifier for Google", 400);
			}
			profile = await handleGoogleCallback(code, codeVerifier);
		} else {
			profile = await handleAppleCallback(
				code,
				user?.firstName,
				user?.lastName,
			);
		}

		const result = await oauthService.handleOAuthUser(profile, anonymousUserId);
		c.get("log").info(
			{ userId: result.user.id, provider },
			"oauth token exchange",
		);

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
	},
);

oauthRoute.post(
	"/link-password",
	authGuard,
	zValidator("json", linkPasswordBody),
	async (c) => {
		const userId = c.get("userId");
		const { password } = c.req.valid("json");

		const result = await oauthService.linkPassword(userId, password);
		if (!result) {
			return fail(c, "User not found", 404);
		}
		if ("error" in result) {
			return fail(c, String(result.error), 409);
		}

		c.get("log").info({}, "password linked to account");
		return ok(c, { message: "Password set successfully" });
	},
);
