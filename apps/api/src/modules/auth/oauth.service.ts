import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "../../lib/jwt.js";
import type { OAuthProfile } from "../../lib/oauth/google.js";
import * as authRepo from "./auth.repository.js";
import * as oauthRepo from "./oauth.repository.js";

function sanitizeUser(
	user: NonNullable<Awaited<ReturnType<typeof authRepo.findUserById>>>,
) {
	const { password: _password, ...rest } = user;
	return rest;
}

async function issueTokens(
	user: NonNullable<Awaited<ReturnType<typeof authRepo.findUserById>>>,
) {
	const accessToken = await signAccessToken(user.id);
	const refreshToken = await signRefreshToken(user.id, user.tokenVersion);
	return { accessToken, refreshToken };
}

function generateUsername(provider: string): string {
	const rand = Math.random().toString(36).slice(2, 10);
	return `${provider}_${rand}`;
}

function buildAccountValues(userId: string, profile: OAuthProfile) {
	return {
		userId,
		provider: profile.provider,
		providerUserId: profile.providerUserId,
		email: profile.email,
		displayName: profile.displayName,
		avatarUrl: profile.avatarUrl,
		accessToken: profile.accessToken,
		refreshToken: profile.refreshToken,
		expiresAt: profile.expiresAt,
	};
}

export async function handleOAuthUser(
	profile: OAuthProfile,
	anonymousUserId?: string,
) {
	const existingAccount = await oauthRepo.findAccountByProvider(
		profile.provider,
		profile.providerUserId,
	);

	if (existingAccount) {
		await oauthRepo.updateAccountTokens(existingAccount.id, {
			accessToken: profile.accessToken,
			refreshToken: profile.refreshToken,
			expiresAt: profile.expiresAt,
		});

		const user = await authRepo.findUserById(existingAccount.userId);
		if (!user) throw new Error("User not found for existing account");
		return { user: sanitizeUser(user), ...(await issueTokens(user)) };
	}

	if (anonymousUserId) {
		const anon = await authRepo.findUserById(anonymousUserId);
		if (anon?.isAnonymous) {
			const user = await authRepo.updateUser(anonymousUserId, {
				email: profile.email,
				displayName: profile.displayName ?? anon.displayName,
				avatarUrl: profile.avatarUrl ?? anon.avatarUrl,
				username: generateUsername(profile.provider),
				isAnonymous: false,
			});
			await oauthRepo.insertAccount(buildAccountValues(user.id, profile));
			return { user: sanitizeUser(user), ...(await issueTokens(user)) };
		}
	}

	if (profile.email) {
		const existingUser = await authRepo.findUserByEmail(profile.email);
		if (existingUser) {
			await oauthRepo.insertAccount(
				buildAccountValues(existingUser.id, profile),
			);
			return {
				user: sanitizeUser(existingUser),
				...(await issueTokens(existingUser)),
			};
		}
	}

	const user = await authRepo.insertUser({
		email: profile.email,
		username: generateUsername(profile.provider),
		displayName: profile.displayName,
		avatarUrl: profile.avatarUrl,
		isAnonymous: false,
	});
	await oauthRepo.insertAccount(buildAccountValues(user.id, profile));
	return { user: sanitizeUser(user), ...(await issueTokens(user)) };
}

export async function linkPassword(userId: string, password: string) {
	const user = await authRepo.findUserPassword(userId);
	if (!user) return null;
	if (user.password !== null) {
		return { error: "Password already set" as const };
	}

	const hashedPassword = await bcrypt.hash(password, 12);
	await authRepo.updateUser(userId, { password: hashedPassword });
	return { success: true };
}

export async function getLinkedProviders(userId: string) {
	return oauthRepo.findAccountsByUserId(userId);
}
