import { afterAll, beforeAll } from "vitest";
import { initEnv, resetEnv } from "../config/env.js";

beforeAll(() => {
	process.env.NODE_ENV = "test";
	process.env.DATABASE_URL =
		"postgres://test:test@localhost:5432/notiving_test";
	process.env.JWT_SECRET = "test-secret-16chars";
	process.env.JWT_REFRESH_SECRET = "test-refresh-secret-16chars";
	process.env.RESEND_API_KEY = "re_test_key";
	process.env.RESEND_FROM_EMAIL = "test@example.com";

	resetEnv();
	initEnv(process.env);
});

afterAll(() => {
	resetEnv();
});
