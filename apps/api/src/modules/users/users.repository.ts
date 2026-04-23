import { eq, gt } from "drizzle-orm";
import { getDb } from "../../db/index.js";
import { users } from "../../db/schema.js";

const publicColumns = {
	id: users.id,
	username: users.username,
	displayName: users.displayName,
	bio: users.bio,
	avatarUrl: users.avatarUrl,
	createdAt: users.createdAt,
	updatedAt: users.updatedAt,
};

export type PublicUser = typeof publicColumns;

export async function listUsers(cursor: string | undefined, limit: number) {
	const condition = cursor ? gt(users.id, cursor) : undefined;
	return getDb()
		.select(publicColumns)
		.from(users)
		.where(condition)
		.limit(limit + 1)
		.orderBy(users.id);
}

export async function findUserById(id: string) {
	const [user] = await getDb()
		.select(publicColumns)
		.from(users)
		.where(eq(users.id, id))
		.limit(1);
	return user ?? null;
}

export async function updateUser(id: string, values: Record<string, unknown>) {
	const [user] = await getDb()
		.update(users)
		.set({ ...values, updatedAt: new Date() })
		.where(eq(users.id, id))
		.returning(publicColumns);
	return user ?? null;
}

export async function deleteUser(id: string) {
	const [user] = await getDb()
		.delete(users)
		.where(eq(users.id, id))
		.returning({ id: users.id });
	return user ?? null;
}
