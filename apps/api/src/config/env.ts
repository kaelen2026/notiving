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
	RESEND_API_KEY: z.string().min(1),
	RESEND_FROM_EMAIL: z.string().email(),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

/**
 * Initialize env from raw bindings (Workers c.env or Node process.env).
 * Idempotent — no-ops if already initialized.
 */
export function initEnv(raw: Record<string, unknown>): void {
	if (_env) return;

	const result = envSchema.safeParse(raw);
	if (!result.success) {
		console.error("Invalid environment variables:");
		console.error(result.error.flatten().fieldErrors);
		throw new Error("Environment validation failed");
	}
	_env = result.data;
}

/** Get validated env. Throws if initEnv() hasn't been called. */
export function getEnv(): Env {
	if (!_env) throw new Error("Env not initialized — call initEnv() first");
	return _env;
}

/** Reset env (for tests only). */
export function resetEnv(): void {
	_env = null;
}
