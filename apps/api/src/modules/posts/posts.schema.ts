import { z } from "zod";

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

export const postIdParam = z.object({
	id: z.string().uuid(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
