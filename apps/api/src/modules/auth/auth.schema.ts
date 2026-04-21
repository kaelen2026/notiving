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

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
