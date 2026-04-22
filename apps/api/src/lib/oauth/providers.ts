import { decodeBase64IgnorePadding } from "@oslojs/encoding";
import * as arctic from "arctic";
import { env } from "../../config/env.js";

export const OAUTH_PROVIDERS = ["google", "apple"] as const;
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

export function isOAuthProvider(value: string): value is OAuthProvider {
	return (OAUTH_PROVIDERS as readonly string[]).includes(value);
}

function createGoogle() {
	if (
		!env.GOOGLE_CLIENT_ID ||
		!env.GOOGLE_CLIENT_SECRET ||
		!env.OAUTH_REDIRECT_BASE_URL
	) {
		return null;
	}
	return new arctic.Google(
		env.GOOGLE_CLIENT_ID,
		env.GOOGLE_CLIENT_SECRET,
		`${env.OAUTH_REDIRECT_BASE_URL}/api/v1/auth/oauth/google/callback`,
	);
}

function parseApplePrivateKey(pem: string): Uint8Array {
	return decodeBase64IgnorePadding(
		pem
			.replace("-----BEGIN PRIVATE KEY-----", "")
			.replace("-----END PRIVATE KEY-----", "")
			.replaceAll("\r", "")
			.replaceAll("\n", "")
			.trim(),
	);
}

function createApple() {
	if (
		!env.APPLE_CLIENT_ID ||
		!env.APPLE_TEAM_ID ||
		!env.APPLE_KEY_ID ||
		!env.APPLE_PRIVATE_KEY ||
		!env.OAUTH_REDIRECT_BASE_URL
	) {
		return null;
	}
	return new arctic.Apple(
		env.APPLE_CLIENT_ID,
		env.APPLE_TEAM_ID,
		env.APPLE_KEY_ID,
		parseApplePrivateKey(env.APPLE_PRIVATE_KEY),
		`${env.OAUTH_REDIRECT_BASE_URL}/api/v1/auth/oauth/apple/callback`,
	);
}

export const googleProvider = createGoogle();
export const appleProvider = createApple();

export function getProvider(name: OAuthProvider): arctic.Google | arctic.Apple {
	if (name === "google") {
		if (!googleProvider) throw new Error("Google OAuth not configured");
		return googleProvider;
	}
	if (!appleProvider) throw new Error("Apple OAuth not configured");
	return appleProvider;
}
