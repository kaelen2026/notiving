import type * as arctic from "arctic";
import type { OAuthProvider } from "./providers.js";
import { getProvider } from "./providers.js";

export interface OAuthProfile {
	provider: OAuthProvider;
	providerUserId: string;
	email: string | null;
	displayName: string | null;
	avatarUrl: string | null;
	accessToken: string;
	refreshToken: string | null;
	expiresAt: Date | null;
}

export async function getGoogleAuthorizationUrl(
	state: string,
	codeVerifier: string,
): Promise<URL> {
	const google = getProvider("google") as arctic.Google;
	return google.createAuthorizationURL(state, codeVerifier, [
		"openid",
		"email",
		"profile",
	]);
}

export async function handleGoogleCallback(
	code: string,
	codeVerifier: string,
): Promise<OAuthProfile> {
	const google = getProvider("google") as arctic.Google;
	const tokens = await google.validateAuthorizationCode(code, codeVerifier);
	const accessToken = tokens.accessToken();

	const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	if (!res.ok) {
		throw new Error(`Google userinfo request failed: ${res.status}`);
	}
	const userinfo = (await res.json()) as {
		sub: string;
		email?: string;
		name?: string;
		picture?: string;
	};

	return {
		provider: "google",
		providerUserId: userinfo.sub,
		email: userinfo.email ?? null,
		displayName: userinfo.name ?? null,
		avatarUrl: userinfo.picture ?? null,
		accessToken,
		refreshToken: tokens.hasRefreshToken() ? tokens.refreshToken() : null,
		expiresAt: tokens.accessTokenExpiresAt(),
	};
}
