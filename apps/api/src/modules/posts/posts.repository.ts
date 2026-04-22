import { and, eq, gt } from "drizzle-orm";
import { db } from "../../db/index.js";
import { posts } from "../../db/schema.js";

type PostRow = typeof posts.$inferSelect;
type NewPost = typeof posts.$inferInsert;

export async function listPosts(
	cursor: string | undefined,
	limit: number,
	authorId?: string,
) {
	const conditions = [];
	if (cursor) conditions.push(gt(posts.id, cursor));
	if (authorId) conditions.push(eq(posts.authorId, authorId));
	conditions.push(eq(posts.published, true));

	return db
		.select()
		.from(posts)
		.where(and(...conditions))
		.limit(limit + 1)
		.orderBy(posts.id);
}

export async function findPostById(id: string): Promise<PostRow | null> {
	const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
	return post ?? null;
}

export async function insertPost(values: NewPost): Promise<PostRow> {
	const [post] = await db.insert(posts).values(values).returning();
	return post;
}

export async function updatePost(
	id: string,
	values: Record<string, unknown>,
): Promise<PostRow | null> {
	const [post] = await db
		.update(posts)
		.set({ ...values, updatedAt: new Date() })
		.where(eq(posts.id, id))
		.returning();
	return post ?? null;
}

export async function deletePost(id: string): Promise<{ id: string } | null> {
	const [post] = await db
		.delete(posts)
		.where(eq(posts.id, id))
		.returning({ id: posts.id });
	return post ?? null;
}
