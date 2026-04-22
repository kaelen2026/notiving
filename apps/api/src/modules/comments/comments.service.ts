import { notFound } from "../../lib/api-response.js";
import { toPaginatedResult } from "../../lib/pagination.js";
import * as repo from "./comments.repository.js";
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
	const rows = await repo.listComments(cursor, limit, postId, parentId);
	return toPaginatedResult(rows, limit);
}

export async function getCommentById(id: string) {
	const comment = await repo.findCommentById(id);
	if (!comment) notFound("Comment not found");
	return comment;
}

export async function createComment(
	authorId: string,
	input: CreateCommentInput,
) {
	return repo.insertComment({ ...input, authorId });
}

export async function updateComment(id: string, input: UpdateCommentInput) {
	const comment = await repo.updateComment(id, input);
	if (!comment) notFound("Comment not found");
	return comment;
}

export async function deleteComment(id: string) {
	const comment = await repo.deleteComment(id);
	if (!comment) notFound("Comment not found");
}
