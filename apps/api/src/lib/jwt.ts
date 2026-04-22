import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";

export interface TokenPayload {
	sub: string;
	version?: string;
}

export function signAccessToken(userId: string): string {
	return jwt.sign({ sub: userId }, env.JWT_SECRET, {
		expiresIn: ACCESS_TOKEN_TTL,
	});
}

export function signRefreshToken(userId: string, tokenVersion: string): string {
	return jwt.sign(
		{ sub: userId, version: tokenVersion },
		env.JWT_REFRESH_SECRET,
		{
			expiresIn: REFRESH_TOKEN_TTL,
		},
	);
}

export function verifyAccessToken(token: string): TokenPayload {
	return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
	return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}
