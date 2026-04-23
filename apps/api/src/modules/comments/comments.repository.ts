import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "../../db/index.js";
import { comments } from "../../db/schema.js";

type CommentRow = typeof comments.$inferSelect;
type NewComment = typeof comments.$inferInsert;

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

	const db = getDb();
	return db
		.select()
		.from(comments)
		.where(conditions.length > 0 ? and(...conditions) : undefined)
		.limit(limit + 1)
		.orderBy(comments.id);
}

export async function findCommentById(id: string): Promise<CommentRow | null> {
	const db = getDb();
	const [comment] = await db
		.select()
		.from(comments)
		.where(eq(comments.id, id))
		.limit(1);
	return comment ?? null;
}

export async function insertComment(values: NewComment): Promise<CommentRow> {
	const [comment] = await getDb().insert(comments).values(values).returning();
	return comment;
}

export async function updateComment(
	id: string,
	values: Record<string, unknown>,
): Promise<CommentRow | null> {
	const [comment] = await getDb()
		.update(comments)
		.set({ ...values, updatedAt: new Date() })
		.where(eq(comments.id, id))
		.returning();
	return comment ?? null;
}

export async function deleteComment(
	id: string,
): Promise<{ id: string } | null> {
	const [comment] = await getDb()
		.delete(comments)
		.where(eq(comments.id, id))
		.returning({ id: comments.id });
	return comment ?? null;
}
