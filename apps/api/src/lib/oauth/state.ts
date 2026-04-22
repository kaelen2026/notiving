import crypto from "node:crypto";
import { eq, lt } from "drizzle-orm";
import { db } from "../../db/index.js";
import { oauthStates } from "../../db/schema.js";

const STATE_TTL_MS = 10 * 60 * 1000;

export async function createOAuthState(params: {
	provider: string;
	deviceType: string;
	codeVerifier?: string;
	nonce?: string;
	redirectUri?: string;
}): Promise<string> {
	const state = crypto.randomBytes(32).toString("hex");
	const expiresAt = new Date(Date.now() + STATE_TTL_MS);

	await db.insert(oauthStates).values({
		state,
		provider: params.provider,
		deviceType: params.deviceType,
		codeVerifier: params.codeVerifier,
		nonce: params.nonce,
		redirectUri: params.redirectUri,
		expiresAt,
	});

	return state;
}

export async function consumeOAuthState(state: string) {
	const rows = await db
		.delete(oauthStates)
		.where(eq(oauthStates.state, state))
		.returning();

	const row = rows[0];
	if (!row || row.expiresAt < new Date()) {
		return null;
	}
	return row;
}

export async function cleanExpiredStates() {
	await db.delete(oauthStates).where(lt(oauthStates.expiresAt, new Date()));
}
