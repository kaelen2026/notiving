import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../../db/index.js";
import { comments } from "../../db/schema.js";
import { notFound } from "../../lib/api-response.js";
import { toPaginatedResult } from "../../lib/pagination.js";
import type {
	CreateCommentInput,
	UpdateCommentInput,
} from "./comments.schema.js";

export async function listComments(
	cursor: string | undefined,
	limit: number,
	postId?: string,
	parentId?: string | null,
) {
	const conditions = [];
	if (cursor) conditions.push(gt(comments.id, cursor));
	if (postId) conditions.push(eq(comments.postId, postId));
	if (parentId === undefined) {
		conditions.push(isNull(comments.parentId));
	} else if (parentId) {
		conditions.push(eq(comments.parentId, parentId));
	}

	const rows = await db
		.select()
		.from(comments)
		.where(conditions.length > 0 ? and(...conditions) : undefined)
		.limit(limit + 1)
		.orderBy(comments.id);

	return toPaginatedResult(rows, limit);
}

export async function getCommentById(id: string) {
	const [comment] = await db
		.select()
		.from(comments)
		.where(eq(comments.id, id))
		.limit(1);

	if (!comment) notFound("Comment not found");
	return comment;
}

export async function createComment(
	authorId: string,
	input: CreateCommentInput,
) {
	const [comment] = await db
		.insert(comments)
		.values({ ...input, authorId })
		.returning();

	return comment;
}

export async function updateComment(id: string, input: UpdateCommentInput) {
	const [comment] = await db
		.update(comments)
		.set({ ...input, updatedAt: new Date() })
		.where(eq(comments.id, id))
		.returning();

	if (!comment) notFound("Comment not found");
	return comment;
}

export async function deleteComment(id: string) {
	const [comment] = await db
		.delete(comments)
		.where(eq(comments.id, id))
		.returning({ id: comments.id });

	if (!comment) notFound("Comment not found");
}
