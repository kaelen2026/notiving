import { and, eq, gt } from "drizzle-orm";
import { db } from "../../db/index.js";
import { posts } from "../../db/schema.js";
import { notFound } from "../../lib/api-response.js";
import { toPaginatedResult } from "../../lib/pagination.js";
import type { CreatePostInput, UpdatePostInput } from "./posts.schema.js";

export async function listPosts(
	cursor: string | undefined,
	limit: number,
	authorId?: string,
) {
	const conditions = [];
	if (cursor) conditions.push(gt(posts.id, cursor));
	if (authorId) conditions.push(eq(posts.authorId, authorId));
	conditions.push(eq(posts.published, true));

	const rows = await db
		.select()
		.from(posts)
		.where(and(...conditions))
		.limit(limit + 1)
		.orderBy(posts.id);

	return toPaginatedResult(rows, limit);
}

export async function getPostById(id: string) {
	const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);

	if (!post) notFound("Post not found");
	return post;
}

export async function createPost(authorId: string, input: CreatePostInput) {
	const [post] = await db
		.insert(posts)
		.values({ ...input, authorId })
		.returning();

	return post;
}

export async function updatePost(id: string, input: UpdatePostInput) {
	const [post] = await db
		.update(posts)
		.set({ ...input, updatedAt: new Date() })
		.where(eq(posts.id, id))
		.returning();

	if (!post) notFound("Post not found");
	return post;
}

export async function deletePost(id: string) {
	const [post] = await db
		.delete(posts)
		.where(eq(posts.id, id))
		.returning({ id: posts.id });

	if (!post) notFound("Post not found");
}
