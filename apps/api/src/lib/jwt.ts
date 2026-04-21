import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_REFRESH_SECRET =
	process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";

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
