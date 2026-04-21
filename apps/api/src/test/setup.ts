import { beforeAll, afterAll } from "vitest";

beforeAll(() => {
	process.env.NODE_ENV = "test";
	process.env.DATABASE_URL = "postgres://test:test@localhost:5432/notiving_test";
	process.env.JWT_SECRET = "test-secret-16chars";
	process.env.JWT_REFRESH_SECRET = "test-refresh-secret-16chars";
});

afterAll(() => {
	// Cleanup if needed
});
