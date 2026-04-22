import { z } from "zod";

export const oauthProviderParam = z.enum(["google", "apple"]);

export const oauthInitiateQuery = z.object({
	redirect_uri: z.string().url().max(512).optional(),
});

export const oauthTokenBody = z.object({
	code: z.string().min(1),
	codeVerifier: z.string().optional(),
	nonce: z.string().optional(),
	user: z
		.object({
			firstName: z.string().optional(),
			lastName: z.string().optional(),
		})
		.optional(),
});

export const linkPasswordBody = z.object({
	password: z.string().min(8).max(128),
});
