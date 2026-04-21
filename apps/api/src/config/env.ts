import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	PORT: z.coerce.number().int().positive().default(3001),
	DATABASE_URL: z.string().url(),
	JWT_SECRET: z.string().min(16),
	JWT_REFRESH_SECRET: z.string().min(16),
	CORS_ORIGIN: z
		.string()
		.optional()
		.transform((val) => val?.split(",").map((o) => o.trim()) ?? []),
});

function validateEnv() {
	const result = envSchema.safeParse(process.env);

	if (!result.success) {
		console.error("❌ Invalid environment variables:");
		console.error(result.error.flatten().fieldErrors);
		throw new Error("Environment validation failed");
	}

	return result.data;
}

export const env = validateEnv();
