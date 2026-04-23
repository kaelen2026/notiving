import bcrypt from "bcryptjs";
import { HTTPException } from "hono/http-exception";
import { conflict } from "../../lib/api-response.js";
import { sendEmail } from "../../lib/email.js";
import {
	signAccessToken,
	signRefreshToken,
	verifyRefreshToken,
} from "../../lib/jwt.js";
import * as repo from "./auth.repository.js";
import type {
	LoginInput,
	RegisterInput,
	VerifyEmailCodeInput,
} from "./auth.schema.js";

type UserRow = Awaited<ReturnType<typeof repo.findUserById>> & {};

function sanitizeUser(user: NonNullable<UserRow>) {
	const { password: _password, ...rest } = user;
	return rest;
}

async function issueTokens(user: NonNullable<UserRow>) {
	const accessToken = await signAccessToken(user.id);
	const refreshToken = await signRefreshToken(user.id, user.tokenVersion);
	return { accessToken, refreshToken };
}

export async function register(input: RegisterInput, anonymousUserId?: string) {
	const existing = await repo.findUserByEmail(input.email);
	if (existing) conflict("Email already registered");

	const existingUsername = await repo.findUserByUsername(input.username);
	if (existingUsername) conflict("Username already taken");

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
			await repo.upsertAccount(user.id, "password", input.email, input.email);
			return { user: sanitizeUser(user), ...(await issueTokens(user)) };
		}
	}

	try {
		const user = await repo.insertUser({
			username: input.username,
			email: input.email,
			password: hashedPassword,
			displayName: input.displayName,
		});
		await repo.upsertAccount(user.id, "password", input.email, input.email);
		return { user: sanitizeUser(user), ...(await issueTokens(user)) };
	} catch (err: unknown) {
		const dbError = err as { code?: string; detail?: string };
		if (dbError.code === "23505") {
			if (dbError.detail?.includes("email")) return conflict("Email already registered");
			if (dbError.detail?.includes("username")) return conflict("Username already taken");
			return conflict("Duplicate entry");
		}
		throw err;
	}
}

export async function login(input: LoginInput) {
	const user = await repo.findUserByEmail(input.email);
	if (!user || !user.password) return null;
	const valid = await bcrypt.compare(input.password, user.password);
	if (!valid) return null;
	await repo.upsertAccount(user.id, "password", input.email, input.email);
	return { user: sanitizeUser(user), ...(await issueTokens(user)) };
}

export async function refresh(refreshTokenStr: string) {
	const payload = await verifyRefreshToken(refreshTokenStr);
	const user = await repo.findUserById(payload.sub);
	if (!user) return null;
	if (payload.version !== user.tokenVersion) return null;

	const newTokenVersion = crypto.randomUUID();
	await repo.updateUser(user.id, { tokenVersion: newTokenVersion });

	const accessToken = await signAccessToken(user.id);
	const newRefreshToken = await signRefreshToken(user.id, newTokenVersion);
	return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(userId: string) {
	await repo.updateUser(userId, { tokenVersion: crypto.randomUUID() });
}

export async function getMe(userId: string) {
	const user = await repo.findUserById(userId);
	if (!user) return null;
	const linkedAccounts = await repo.findAccountsByUserId(userId);
	return { ...sanitizeUser(user), hasPassword: user.password !== null, providers: linkedAccounts };
}

export async function createAnonymousUser() {
	const user = await repo.insertUser({ isAnonymous: true });
	return { user: sanitizeUser(user), ...(await issueTokens(user)) };
}

export async function sendEmailCode(email: string) {
	const recent = await repo.findRecentCode(email, new Date(Date.now() - 60_000));
	if (recent) {
		throw new HTTPException(429, { message: "Please wait before requesting another code" });
	}
	const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, "0");
	const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
	await repo.insertEmailCode(email, code, expiresAt);
	await sendEmail(email, "Your verification code", `Your verification code is: ${code}`);
	return { message: "Verification code sent" };
}

export async function verifyEmailCode(input: VerifyEmailCodeInput, anonymousUserId?: string) {
	const record = await repo.findLatestValidCode(input.email);
	if (!record) return null;

	if (record.attempts >= 5) {
		await repo.markCodeUsed(record.id);
		throw new HTTPException(400, { message: "Too many attempts, please request a new code" });
	}
	if (record.code !== input.code) {
		await repo.incrementCodeAttempts(record.id);
		throw new HTTPException(400, { message: "Invalid verification code" });
	}
	await repo.markCodeUsed(record.id);

	const existingUser = await repo.findUserByEmail(input.email);
	if (existingUser) {
		await repo.upsertAccount(existingUser.id, "email", input.email, input.email);
		return { user: sanitizeUser(existingUser), ...(await issueTokens(existingUser)) };
	}

	if (anonymousUserId) {
		const anon = await repo.findUserById(anonymousUserId);
		if (anon?.isAnonymous) {
			const user = await repo.updateUser(anonymousUserId, {
				email: input.email,
				username: `user_${Math.random().toString(36).slice(2, 10)}`,
				isAnonymous: false,
			});
			await repo.upsertAccount(user.id, "email", input.email, input.email);
			return { user: sanitizeUser(user), ...(await issueTokens(user)) };
		}
	}

	const user = await repo.insertUser({
		email: input.email,
		username: `user_${Math.random().toString(36).slice(2, 10)}`,
		isAnonymous: false,
	});
	await repo.upsertAccount(user.id, "email", input.email, input.email);
	return { user: sanitizeUser(user), ...(await issueTokens(user)) };
}