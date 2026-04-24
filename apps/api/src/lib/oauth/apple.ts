import * as arctic from "arctic";
import { importPKCS8, SignJWT } from "jose";
import { getEnv } from "../../config/env.js";
import type { OAuthProfile } from "./google.js";
import { getProvider } from "./providers.js";

export async function getAppleAuthorizationUrl(
	state: string,
	_nonce: string,
): Promise<URL> {
	const apple = getProvider("apple") as arctic.Apple;
	return apple.createAuthorizationURL(state, ["name", "email"]);
}

export async function handleAppleCallback(
	code: string,
	firstName?: string,
	lastName?: string,
): Promise<OAuthProfile> {
	const apple = getProvider("apple") as arctic.Apple;
	const tokens = await apple.validateAuthorizationCode(code);
	const accessToken = tokens.accessToken();
	const idToken = tokens.idToken();
	const claims = arctic.decodeIdToken(idToken) as {
		sub: string;
		email?: string;
	};

	const displayName = [firstName, lastName].filter(Boolean).join(" ") || null;

	return {
		provider: "apple",
		providerUserId: claims.sub,
		email: claims.email ?? null,
		displayName,
		avatarUrl: null,
		accessToken,
		refreshToken: tokens.hasRefreshToken() ? tokens.refreshToken() : null,
		expiresAt: tokens.accessTokenExpiresAt(),
	};
}

export async function handleAppleNativeCallback(
	code: string,
	firstName?: string,
	lastName?: string,
): Promise<OAuthProfile> {
	const env = getEnv();
	if (
		!env.APPLE_IOS_BUNDLE_ID ||
		!env.APPLE_TEAM_ID ||
		!env.APPLE_KEY_ID ||
		!env.APPLE_PRIVATE_KEY
	) {
		throw new Error("Apple native OAuth not configured");
	}

	const pem = env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n");
	const privateKey = await importPKCS8(pem, "ES256");
	const now = Math.floor(Date.now() / 1000);
	const clientSecret = await new SignJWT({})
		.setProtectedHeader({ alg: "ES256", kid: env.APPLE_KEY_ID })
		.setIssuer(env.APPLE_TEAM_ID)
		.setSubject(env.APPLE_IOS_BUNDLE_ID)
		.setAudience("https://appleid.apple.com")
		.setIssuedAt(now)
		.setExpirationTime(now + 5 * 60)
		.sign(privateKey);

	const body = new URLSearchParams();
	body.set("grant_type", "authorization_code");
	body.set("code", code);
	body.set("client_id", env.APPLE_IOS_BUNDLE_ID);
	body.set("client_secret", clientSecret);

	const res = await fetch("https://appleid.apple.com/auth/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: body.toString(),
	});

	if (!res.ok) {
		const errorBody = await res.text();
		throw new Error(`Apple token exchange failed: ${res.status} ${errorBody}`);
	}

	const tokenData = (await res.json()) as {
		access_token: string;
		id_token: string;
		refresh_token?: string;
		expires_in?: number;
	};

	const claims = arctic.decodeIdToken(tokenData.id_token) as {
		sub: string;
		email?: string;
	};

	const displayName = [firstName, lastName].filter(Boolean).join(" ") || null;

	return {
		provider: "apple",
		providerUserId: claims.sub,
		email: claims.email ?? null,
		displayName,
		avatarUrl: null,
		accessToken: tokenData.access_token,
		refreshToken: tokenData.refresh_token ?? null,
		expiresAt: tokenData.expires_in
			? new Date(Date.now() + tokenData.expires_in * 1000)
			: null,
	};
}
