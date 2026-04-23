import { describe, expect, it } from "vitest";
import createApp from "../app.js";

const app = createApp();

describe("Health Check", () => {
	it("should return health status with checks", async () => {
		const req = new Request("http://localhost/health");
		const response = await app.fetch(req);
		const body = await response.json();

		// In test env without real DB, status may be 503
		expect([200, 503]).toContain(response.status);
		expect(body.data).toHaveProperty("status", "ok");
		expect(body.data).toHaveProperty("database");
	});
});

describe("Auth Endpoints", () => {
	describe("POST /api/v1/auth/register", () => {
		it("should reject invalid email", async () => {
			const req = new Request("http://localhost/api/v1/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username: "testuser",
					email: "invalid-email",
					password: "password123",
				}),
			});
			const response = await app.fetch(req);
			const body = await response.json();

			expect(response.status).toBe(400);
			expect(body.success).toBe(false);
		});

		it("should reject short password", async () => {
			const req = new Request("http://localhost/api/v1/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username: "testuser",
					email: "test@example.com",
					password: "short",
				}),
			});
			const response = await app.fetch(req);
			const body = await response.json();

			expect(response.status).toBe(400);
			expect(body.success).toBe(false);
		});

		it("should reject invalid username format", async () => {
			const req = new Request("http://localhost/api/v1/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username: "test user!",
					email: "test@example.com",
					password: "password123",
				}),
			});
			const response = await app.fetch(req);
			const body = await response.json();

			expect(response.status).toBe(400);
			expect(body.success).toBe(false);
		});
	});

	describe("POST /api/v1/auth/login", () => {
		it("should reject missing credentials", async () => {
			const req = new Request("http://localhost/api/v1/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({}),
			});
			const response = await app.fetch(req);
			const body = await response.json();

			expect(response.status).toBe(400);
			expect(body.success).toBe(false);
		});
	});
});

describe("Rate Limiting", () => {
	it("should rate limit auth endpoints", async () => {
		const requests = Array.from({ length: 12 }, () => {
			const req = new Request("http://localhost/api/v1/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: "test@example.com",
					password: "password123",
				}),
			});
			return app.fetch(req);
		});

		const responses = await Promise.all(requests);
		const rateLimited = responses.filter((r) => r.status === 429);

		expect(rateLimited.length).toBeGreaterThan(0);
	});
});
