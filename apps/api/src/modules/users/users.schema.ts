import { z } from "zod";

export const updateUserSchema = z.object({
	displayName: z.string().max(64).optional(),
	bio: z.string().max(500).optional(),
	avatarUrl: z.string().url().max(512).optional(),
});

export const userIdParam = z.object({
	id: z.string().uuid(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
