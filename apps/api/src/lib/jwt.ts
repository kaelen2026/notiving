import jwt from "jsonwebtoken";

function requireEnv(name: string, devFallback: string): string {
	const value = process.env[name];
	if (value) return value;
	if (process.env.NODE_ENV === "production") {
		throw new Error(`${name} must be set in production`);
	}
	return devFallback;
}

const JWT_SECRET = requireEnv("JWT_SECRET", "dev-secret");
const JWT_REFRESH_SECRET = requireEnv("JWT_REFRESH_SECRET", "dev-refresh-secret");

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";

export interface TokenPayload {
	sub: string;
}

export function signAccessToken(userId: string): string {
	return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}

export function signRefreshToken(userId: string): string {
	return jwt.sign({ sub: userId }, JWT_REFRESH_SECRET, {
		expiresIn: REFRESH_TOKEN_TTL,
	});
}

export function verifyAccessToken(token: string): TokenPayload {
	return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
	return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
}
