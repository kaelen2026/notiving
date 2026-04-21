import { z } from "zod";

export const registerSchema = z.object({
	username: z
		.string()
		.min(3)
		.max(32)
		.regex(/^[a-zA-Z0-9_-]+$/),
	email: z.string().email().max(255),
	password: z.string().min(8).max(128),
	displayName: z.string().max(64).optional(),
});

export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string(),
});

export const refreshSchema = z.object({
	refreshToken: z.string(),
});

export const createPostSchema = z.object({
	title: z.string().min(1).max(256),
	content: z.string().min(1),
	slug: z
		.string()
		.min(1)
		.max(256)
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
	published: z.boolean().optional(),
});

export const updatePostSchema = z.object({
	title: z.string().min(1).max(256).optional(),
	content: z.string().min(1).optional(),
	slug: z
		.string()
		.min(1)
		.max(256)
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
		.optional(),
	published: z.boolean().optional(),
});

export const createCommentSchema = z.object({
	content: z.string().min(1).max(2000),
	postId: z.string().uuid(),
	parentId: z.string().uuid().optional(),
});

export const updateCommentSchema = z.object({
	content: z.string().min(1).max(2000),
});

export const updateUserSchema = z.object({
	displayName: z.string().max(64).optional(),
	bio: z.string().max(500).optional(),
	avatarUrl: z.string().url().max(512).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
