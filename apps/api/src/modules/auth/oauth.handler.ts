import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { accounts, users } from "../../db/schema.js";
import { signAccessToken, signRefreshToken } from "../../lib/jwt.js";
import type { OAuthProfile } from "../../lib/oauth/google.js";

function sanitizeUser(user: typeof users.$inferSelect) {
	const { password: _password, ...rest } = user;
	return rest;
}

function generateUsername(provider: string): string {
	const rand = Math.random().toString(36).slice(2, 10);
	return `${provider}_${rand}`;
}

export async function handleOAuthUser(
	profile: OAuthProfile,
	anonymousUserId?: string,
) {
	const existingAccount = await db
		.select()
		.from(accounts)
		.where(
			and(
				eq(accounts.provider, profile.provider),
				eq(accounts.providerUserId, profile.providerUserId),
			),
		)
		.limit(1);

	if (existingAccount.length > 0) {
		const account = existingAccount[0];
		await db
			.update(accounts)
			.set({
				accessToken: profile.accessToken,
				refreshToken: profile.refreshToken,
				expiresAt: profile.expiresAt,
				updatedAt: new Date(),
			})
			.where(eq(accounts.id, account.id));

		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.id, account.userId))
			.limit(1);

		const accessToken = signAccessToken(user.id);
		const refreshToken = signRefreshToken(user.id, user.tokenVersion);
		return { user: sanitizeUser(user), accessToken, refreshToken };
	}

	if (anonymousUserId) {
		const [anon] = await db
			.select()
			.from(users)
			.where(eq(users.id, anonymousUserId))
			.limit(1);

		if (anon?.isAnonymous) {
			const [user] = await db
				.update(users)
				.set({
					email: profile.email,
					displayName: profile.displayName ?? anon.displayName,
					avatarUrl: profile.avatarUrl ?? anon.avatarUrl,
					username: generateUsername(profile.provider),
					isAnonymous: false,
					updatedAt: new Date(),
				})
				.where(eq(users.id, anonymousUserId))
				.returning();

			await db.insert(accounts).values({
				userId: user.id,
				provider: profile.provider,
				providerUserId: profile.providerUserId,
				email: profile.email,
				displayName: profile.displayName,
				avatarUrl: profile.avatarUrl,
				accessToken: profile.accessToken,
				refreshToken: profile.refreshToken,
				expiresAt: profile.expiresAt,
			});

			const accessToken = signAccessToken(user.id);
			const refreshToken = signRefreshToken(user.id, user.tokenVersion);
			return { user: sanitizeUser(user), accessToken, refreshToken };
		}
	}

	if (profile.email) {
		const [existingUser] = await db
			.select()
			.from(users)
			.where(eq(users.email, profile.email))
			.limit(1);

		if (existingUser) {
			await db.insert(accounts).values({
				userId: existingUser.id,
				provider: profile.provider,
				providerUserId: profile.providerUserId,
				email: profile.email,
				displayName: profile.displayName,
				avatarUrl: profile.avatarUrl,
				accessToken: profile.accessToken,
				refreshToken: profile.refreshToken,
				expiresAt: profile.expiresAt,
			});

			const accessToken = signAccessToken(existingUser.id);
			const refreshToken = signRefreshToken(
				existingUser.id,
				existingUser.tokenVersion,
			);
			return {
				user: sanitizeUser(existingUser),
				accessToken,
				refreshToken,
			};
		}
	}

	const [user] = await db
		.insert(users)
		.values({
			email: profile.email,
			username: generateUsername(profile.provider),
			displayName: profile.displayName,
			avatarUrl: profile.avatarUrl,
			isAnonymous: false,
		})
		.returning();

	await db.insert(accounts).values({
		userId: user.id,
		provider: profile.provider,
		providerUserId: profile.providerUserId,
		email: profile.email,
		displayName: profile.displayName,
		avatarUrl: profile.avatarUrl,
		accessToken: profile.accessToken,
		refreshToken: profile.refreshToken,
		expiresAt: profile.expiresAt,
	});

	const accessToken = signAccessToken(user.id);
	const refreshToken = signRefreshToken(user.id, user.tokenVersion);
	return { user: sanitizeUser(user), accessToken, refreshToken };
}

export async function linkPassword(userId: string, password: string) {
	const [user] = await db
		.select({ password: users.password })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!user) return null;
	if (user.password !== null) {
		return { error: "Password already set" as const };
	}

	const hashedPassword = await bcrypt.hash(password, 12);
	await db
		.update(users)
		.set({ password: hashedPassword, updatedAt: new Date() })
		.where(eq(users.id, userId));

	return { success: true };
}

export async function getLinkedProviders(userId: string) {
	return db
		.select({
			provider: accounts.provider,
			email: accounts.email,
			linkedAt: accounts.createdAt,
		})
		.from(accounts)
		.where(eq(accounts.userId, userId));
}
