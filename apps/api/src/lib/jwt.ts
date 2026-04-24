import { jwtVerify, SignJWT } from "jose";
import { getEnv } from "../config/env.js";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";

export interface TokenPayload {
	sub: string;
	version?: string;
}

function secret(key: string) {
	return new TextEncoder().encode(key);
}

export async function signAccessToken(userId: string): Promise<string> {
	return new SignJWT({ sub: userId })
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime(ACCESS_TOKEN_TTL)
		.sign(secret(getEnv().JWT_SECRET));
}

export async function signRefreshToken(
	userId: string,
	tokenVersion: string,
): Promise<string> {
	return new SignJWT({ sub: userId, version: tokenVersion })
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime(REFRESH_TOKEN_TTL)
		.sign(secret(getEnv().JWT_REFRESH_SECRET));
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
	const { payload } = await jwtVerify(token, secret(getEnv().JWT_SECRET));
	return payload as unknown as TokenPayload;
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
	const { payload } = await jwtVerify(
		token,
		secret(getEnv().JWT_REFRESH_SECRET),
	);
	return payload as unknown as TokenPayload;
}
