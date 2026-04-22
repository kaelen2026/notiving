import { beforeEach, describe, expect, it } from "vitest";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import * as authHandler from "./auth.handler.js";

describe("Auth Handler", () => {
	beforeEach(async () => {
		// Clean up test data
		await db.delete(users);
	});

	describe("register", () => {
		it("should create a new user with token version", async () => {
			const result = await authHandler.register({
				username: "testuser",
				email: "test@example.com",
				password: "password123",
			});

			expect(result.user.username).toBe("testuser");
			expect(result.user.email).toBe("test@example.com");
			expect(result.accessToken).toBeTruthy();
			expect(result.refreshToken).toBeTruthy();
		});

		it("should reject duplicate email", async () => {
			await authHandler.register({
				username: "user1",
				email: "test@example.com",
				password: "password123",
			});

			await expect(
				authHandler.register({
					username: "user2",
					email: "test@example.com",
					password: "password123",
				}),
			).rejects.toThrow();
		});
	});

	describe("login", () => {
		it("should login with correct credentials", async () => {
			await authHandler.register({
				username: "testuser",
				email: "test@example.com",
				password: "password123",
			});

			const result = await authHandler.login({
				email: "test@example.com",
				password: "password123",
			});

			expect(result).toBeTruthy();
			expect(result?.user.email).toBe("test@example.com");
			expect(result?.accessToken).toBeTruthy();
			expect(result?.refreshToken).toBeTruthy();
		});

		it("should reject wrong password", async () => {
			await authHandler.register({
				username: "testuser",
				email: "test@example.com",
				password: "password123",
			});

			const result = await authHandler.login({
				email: "test@example.com",
				password: "wrongpassword",
			});

			expect(result).toBeNull();
		});
	});

	describe("refresh token rotation", () => {
		it("should rotate token version on refresh", async () => {
			const registerResult = await authHandler.register({
				username: "testuser",
				email: "test@example.com",
				password: "password123",
			});

			const refreshResult = await authHandler.refresh(
				registerResult.refreshToken,
			);

			expect(refreshResult).toBeTruthy();
			expect(refreshResult?.accessToken).toBeTruthy();
			expect(refreshResult?.refreshToken).toBeTruthy();
			expect(refreshResult?.refreshToken).not.toBe(registerResult.refreshToken);
		});

		it("should reject old refresh token after rotation", async () => {
			const registerResult = await authHandler.register({
				username: "testuser",
				email: "test@example.com",
				password: "password123",
			});

			const oldRefreshToken = registerResult.refreshToken;

			// First refresh - should work
			await authHandler.refresh(oldRefreshToken);

			// Second refresh with old token - should fail
			const result = await authHandler.refresh(oldRefreshToken);
			expect(result).toBeNull();
		});
	});
});
