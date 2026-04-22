import * as arctic from "arctic";
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
