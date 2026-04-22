import { and, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { accounts } from "../../db/schema.js";

type AccountRow = typeof accounts.$inferSelect;
type NewAccount = typeof accounts.$inferInsert;

export async function findAccountByProvider(
	provider: string,
	providerUserId: string,
): Promise<AccountRow | null> {
	const [account] = await db
		.select()
		.from(accounts)
		.where(
			and(
				eq(accounts.provider, provider),
				eq(accounts.providerUserId, providerUserId),
			),
		)
		.limit(1);
	return account ?? null;
}

export async function insertAccount(values: NewAccount): Promise<AccountRow> {
	const [account] = await db.insert(accounts).values(values).returning();
	return account;
}

export async function updateAccountTokens(
	id: string,
	tokens: {
		accessToken: string;
		refreshToken: string | null;
		expiresAt: Date | null;
	},
) {
	await db
		.update(accounts)
		.set({ ...tokens, updatedAt: new Date() })
		.where(eq(accounts.id, id));
}

export async function findAccountsByUserId(userId: string) {
	return db
		.select({
			provider: accounts.provider,
			email: accounts.email,
			linkedAt: accounts.createdAt,
		})
		.from(accounts)
		.where(eq(accounts.userId, userId));
}
