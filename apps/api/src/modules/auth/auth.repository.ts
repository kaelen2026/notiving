import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { accounts, users } from "../../db/schema.js";

type UserRow = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;

export async function findUserByEmail(email: string): Promise<UserRow | null> {
	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.email, email))
		.limit(1);
	return user ?? null;
}

export async function findUserByUsername(
	username: string,
): Promise<{ id: string } | null> {
	const [user] = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.username, username))
		.limit(1);
	return user ?? null;
}

export async function findUserById(id: string): Promise<UserRow | null> {
	const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
	return user ?? null;
}

export async function findUserIsAnonymous(
	id: string,
): Promise<{ isAnonymous: boolean } | null> {
	const [user] = await db
		.select({ isAnonymous: users.isAnonymous })
		.from(users)
		.where(eq(users.id, id))
		.limit(1);
	return user ?? null;
}

export async function findUserPassword(
	id: string,
): Promise<{ password: string | null } | null> {
	const [user] = await db
		.select({ password: users.password })
		.from(users)
		.where(eq(users.id, id))
		.limit(1);
	return user ?? null;
}

export async function insertUser(values: NewUser): Promise<UserRow> {
	const [user] = await db.insert(users).values(values).returning();
	return user;
}

export async function updateUser(
	id: string,
	values: Partial<Omit<UserRow, "id" | "createdAt">>,
): Promise<UserRow> {
	const [user] = await db
		.update(users)
		.set({ ...values, updatedAt: new Date() })
		.where(eq(users.id, id))
		.returning();
	return user;
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
