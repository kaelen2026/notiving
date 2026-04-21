import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { conflict } from "../../lib/api-response.js";
import {
	signAccessToken,
	signRefreshToken,
	verifyRefreshToken,
} from "../../lib/jwt.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";

function sanitizeUser(user: typeof users.$inferSelect) {
	const { password: _password, ...rest } = user;
	return rest;
}

export async function register(input: RegisterInput) {
	const existing = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.email, input.email))
		.limit(1);

	if (existing.length > 0) {
		conflict("Email already registered");
	}

	const existingUsername = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.username, input.username))
		.limit(1);

	if (existingUsername.length > 0) {
		conflict("Username already taken");
	}

	const hashedPassword = await bcrypt.hash(input.password, 12);

	let user: typeof users.$inferSelect;
	try {
		const [inserted] = await db
			.insert(users)
			.values({
				username: input.username,
				email: input.email,
				password: hashedPassword,
				displayName: input.displayName,
			})
			.returning();
		user = inserted;
	} catch (err: unknown) {
		const dbError = err as { code?: string; detail?: string };
		if (dbError.code === "23505") {
			if (dbError.detail?.includes("email")) {
				return conflict("Email already registered");
			}
			if (dbError.detail?.includes("username")) {
				return conflict("Username already taken");
			}
			return conflict("Duplicate entry");
		}
		throw err;
	}

	const accessToken = signAccessToken(user.id);
	const refreshToken = signRefreshToken(user.id, user.tokenVersion);

	return { user: sanitizeUser(user), accessToken, refreshToken };
}

export async function login(input: LoginInput) {
	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.email, input.email))
		.limit(1);

	if (!user) {
		return null;
	}

	const valid = await bcrypt.compare(input.password, user.password);
	if (!valid) {
		return null;
	}

	const accessToken = signAccessToken(user.id);
	const refreshToken = signRefreshToken(user.id, user.tokenVersion);

	return { user: sanitizeUser(user), accessToken, refreshToken };
}

export async function refresh(refreshTokenStr: string) {
	const payload = verifyRefreshToken(refreshTokenStr);

	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.id, payload.sub))
		.limit(1);

	if (!user) {
		return null;
	}

	// Verify token version matches
	if (payload.version !== user.tokenVersion) {
		return null;
	}

	// Generate new token version for rotation
	const newTokenVersion = crypto.randomUUID();

	// Update token version in database
	await db
		.update(users)
		.set({ tokenVersion: newTokenVersion, updatedAt: new Date() })
		.where(eq(users.id, user.id));

	const accessToken = signAccessToken(user.id);
	const newRefreshToken = signRefreshToken(user.id, newTokenVersion);

	return { accessToken, refreshToken: newRefreshToken };
}

export async function getMe(userId: string) {
	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!user) return null;
	return sanitizeUser(user);
}
