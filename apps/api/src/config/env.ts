import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.coerce.number().int().positive().default(3001),
	DATABASE_URL: z.string().url(),
	JWT_SECRET: z.string().min(16),
	JWT_REFRESH_SECRET: z.string().min(16),
	CORS_ORIGIN: z
		.string()
		.optional()
		.transform((val) => val?.split(",").map((o) => o.trim()) ?? []),
	GOOGLE_CLIENT_ID: z.string().min(1).optional(),
	GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
	APPLE_CLIENT_ID: z.string().min(1).optional(),
	APPLE_TEAM_ID: z.string().min(1).optional(),
	APPLE_KEY_ID: z.string().min(1).optional(),
	APPLE_PRIVATE_KEY: z.string().min(1).optional(),
	OAUTH_REDIRECT_BASE_URL: z.string().url().optional(),
});

function validateEnv() {
	// In test environment, provide defaults if not set
	if (process.env.NODE_ENV === "test") {
		process.env.DATABASE_URL =
			process.env.DATABASE_URL ||
			"postgres://test:test@localhost:5432/notiving_test";
		process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-16chars";
		process.env.JWT_REFRESH_SECRET =
			process.env.JWT_REFRESH_SECRET || "test-refresh-secret-16chars";
	}

	const result = envSchema.safeParse(process.env);

	if (!result.success) {
		console.error("❌ Invalid environment variables:");
		console.error(result.error.flatten().fieldErrors);
		throw new Error("Environment validation failed");
	}

	return result.data;
}

export const env = validateEnv();
