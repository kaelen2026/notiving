import { decodeBase64IgnorePadding } from "@oslojs/encoding";
import * as arctic from "arctic";
import { getEnv } from "../../config/env.js";

export const OAUTH_PROVIDERS = ["google", "apple"] as const;
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

export function isOAuthProvider(value: string): value is OAuthProvider {
	return (OAUTH_PROVIDERS as readonly string[]).includes(value);
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

let _google: arctic.Google | null | undefined;
let _apple: arctic.Apple | null | undefined;

function getGoogleProvider(): arctic.Google | null {
	if (_google === undefined) {
		const env = getEnv();
		if (
			!env.GOOGLE_CLIENT_ID ||
			!env.GOOGLE_CLIENT_SECRET ||
			!env.OAUTH_REDIRECT_BASE_URL
		) {
			_google = null;
		} else {
			_google = new arctic.Google(
				env.GOOGLE_CLIENT_ID,
				env.GOOGLE_CLIENT_SECRET,
				`${env.OAUTH_REDIRECT_BASE_URL}/v1/auth/oauth/google/callback`,
			);
		}
	}
	return _google;
}

function getAppleProvider(): arctic.Apple | null {
	if (_apple === undefined) {
		const env = getEnv();
		if (
			!env.APPLE_CLIENT_ID ||
			!env.APPLE_TEAM_ID ||
			!env.APPLE_KEY_ID ||
			!env.APPLE_PRIVATE_KEY ||
			!env.OAUTH_REDIRECT_BASE_URL
		) {
			_apple = null;
		} else {
			_apple = new arctic.Apple(
				env.APPLE_CLIENT_ID,
				env.APPLE_TEAM_ID,
				env.APPLE_KEY_ID,
				parseApplePrivateKey(env.APPLE_PRIVATE_KEY),
				`${env.OAUTH_REDIRECT_BASE_URL}/v1/auth/oauth/apple/callback`,
			);
		}
	}
	return _apple;
}

export function getProvider(name: OAuthProvider): arctic.Google | arctic.Apple {
	if (name === "google") {
		const g = getGoogleProvider();
		if (!g) throw new Error("Google OAuth not configured");
		return g;
	}
	const a = getAppleProvider();
	if (!a) throw new Error("Apple OAuth not configured");
	return a;
}
