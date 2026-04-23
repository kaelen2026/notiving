import { eq, lt } from "drizzle-orm";
import { getDb } from "../../db/index.js";
import { oauthStates } from "../../db/schema.js";

const STATE_TTL_MS = 10 * 60 * 1000;

function randomHex(bytes: number): string {
	const buf = new Uint8Array(bytes);
	crypto.getRandomValues(buf);
	return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createOAuthState(params: {
	provider: string;
	deviceType: string;
	codeVerifier?: string;
	nonce?: string;
	redirectUri?: string;
}): Promise<string> {
	const state = randomHex(32);
	const expiresAt = new Date(Date.now() + STATE_TTL_MS);

	await getDb().insert(oauthStates).values({
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
	const rows = await getDb()
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
	await getDb().delete(oauthStates).where(lt(oauthStates.expiresAt, new Date()));
}
