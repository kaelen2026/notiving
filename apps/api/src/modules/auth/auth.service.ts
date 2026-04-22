import bcrypt from "bcryptjs";
import { conflict } from "../../lib/api-response.js";
import {
	signAccessToken,
	signRefreshToken,
	verifyRefreshToken,
} from "../../lib/jwt.js";
import * as repo from "./auth.repository.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";

type UserRow = Awaited<ReturnType<typeof repo.findUserById>> & {};

function sanitizeUser(user: NonNullable<UserRow>) {
	const { password: _password, ...rest } = user;
	return rest;
}

function issueTokens(user: NonNullable<UserRow>) {
	const accessToken = signAccessToken(user.id);
	const refreshToken = signRefreshToken(user.id, user.tokenVersion);
	return { accessToken, refreshToken };
}

export async function register(input: RegisterInput, anonymousUserId?: string) {
	const existing = await repo.findUserByEmail(input.email);
	if (existing) {
		conflict("Email already registered");
	}

	const existingUsername = await repo.findUserByUsername(input.username);
	if (existingUsername) {
		conflict("Username already taken");
	}

	const hashedPassword = await bcrypt.hash(input.password, 12);

	if (anonymousUserId) {
		const anon = await repo.findUserById(anonymousUserId);
		if (anon?.isAnonymous) {
			const user = await repo.updateUser(anonymousUserId, {
				username: input.username,
				email: input.email,
				password: hashedPassword,
				displayName: input.displayName,
				isAnonymous: false,
			});
			return { user: sanitizeUser(user), ...issueTokens(user) };
		}
	}

	try {
		const user = await repo.insertUser({
			username: input.username,
			email: input.email,
			password: hashedPassword,
			displayName: input.displayName,
		});
		return { user: sanitizeUser(user), ...issueTokens(user) };
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
}

export async function login(input: LoginInput) {
	const user = await repo.findUserByEmail(input.email);
	if (!user) return null;
	if (!user.password) return null;

	const valid = await bcrypt.compare(input.password, user.password);
	if (!valid) return null;

	return { user: sanitizeUser(user), ...issueTokens(user) };
}

export async function refresh(refreshTokenStr: string) {
	const payload = verifyRefreshToken(refreshTokenStr);
	const user = await repo.findUserById(payload.sub);
	if (!user) return null;
	if (payload.version !== user.tokenVersion) return null;

	const newTokenVersion = crypto.randomUUID();
	await repo.updateUser(user.id, { tokenVersion: newTokenVersion });

	const accessToken = signAccessToken(user.id);
	const newRefreshToken = signRefreshToken(user.id, newTokenVersion);
	return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(userId: string) {
	const newTokenVersion = crypto.randomUUID();
	await repo.updateUser(userId, { tokenVersion: newTokenVersion });
}

export async function getMe(userId: string) {
	const user = await repo.findUserById(userId);
	if (!user) return null;

	const linkedAccounts = await repo.findAccountsByUserId(userId);
	return {
		...sanitizeUser(user),
		hasPassword: user.password !== null,
		providers: linkedAccounts,
	};
}

export async function createAnonymousUser() {
	const user = await repo.insertUser({ isAnonymous: true });
	return { user: sanitizeUser(user), ...issueTokens(user) };
}
