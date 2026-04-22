import { notFound } from "../../lib/api-response.js";
import { toPaginatedResult } from "../../lib/pagination.js";
import * as repo from "./posts.repository.js";
import type { CreatePostInput, UpdatePostInput } from "./posts.schema.js";

export async function listPosts(
	cursor: string | undefined,
	limit: number,
	authorId?: string,
) {
	const rows = await repo.listPosts(cursor, limit, authorId);
	return toPaginatedResult(rows, limit);
}

export async function getPostById(id: string) {
	const post = await repo.findPostById(id);
	if (!post) notFound("Post not found");
	return post;
}

export async function createPost(authorId: string, input: CreatePostInput) {
	return repo.insertPost({ ...input, authorId });
}

export async function updatePost(id: string, input: UpdatePostInput) {
	const post = await repo.updatePost(id, input);
	if (!post) notFound("Post not found");
	return post;
}

export async function deletePost(id: string) {
	const post = await repo.deletePost(id);
	if (!post) notFound("Post not found");
}
