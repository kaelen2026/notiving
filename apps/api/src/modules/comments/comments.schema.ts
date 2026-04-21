import { z } from "zod";

export const createCommentSchema = z.object({
	content: z.string().min(1).max(2000),
	postId: z.string().uuid(),
	parentId: z.string().uuid().optional(),
});

export const updateCommentSchema = z.object({
	content: z.string().min(1).max(2000),
});

export const commentIdParam = z.object({
	id: z.string().uuid(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
