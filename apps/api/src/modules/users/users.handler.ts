import { eq, gt } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { notFound } from "../../lib/api-response.js";
import { toPaginatedResult } from "../../lib/pagination.js";
import type { UpdateUserInput } from "./users.schema.js";

const publicColumns = {
	id: users.id,
	username: users.username,
	displayName: users.displayName,
	bio: users.bio,
	avatarUrl: users.avatarUrl,
	createdAt: users.createdAt,
	updatedAt: users.updatedAt,
};

export async function listUsers(cursor: string | undefined, limit: number) {
	const condition = cursor ? gt(users.id, cursor) : undefined;

	const rows = await db
		.select(publicColumns)
		.from(users)
		.where(condition)
		.limit(limit + 1)
		.orderBy(users.id);

	return toPaginatedResult(rows, limit);
}

export async function getUserById(id: string) {
	const [user] = await db
		.select(publicColumns)
		.from(users)
		.where(eq(users.id, id))
		.limit(1);

	if (!user) notFound("User not found");
	return user;
}

export async function updateUser(id: string, input: UpdateUserInput) {
	const [user] = await db
		.update(users)
		.set({ ...input, updatedAt: new Date() })
		.where(eq(users.id, id))
		.returning(publicColumns);

	if (!user) notFound("User not found");
	return user;
}

export async function deleteUser(id: string) {
	const [user] = await db
		.delete(users)
		.where(eq(users.id, id))
		.returning({ id: users.id });

	if (!user) notFound("User not found");
}
