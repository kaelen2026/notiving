import { beforeEach, describe, expect, it } from "vitest";
import { db } from "../../db/index.js";
import { accounts, users } from "../../db/schema.js";
import * as authService from "./auth.service.js";

describe("Auth Service", () => {
	beforeEach(async () => {
		await db.delete(accounts);
		await db.delete(users);
	});

	describe("register", () => {
		it("should create a new user with token version", async () => {
			const result = await authService.register({
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
			await authService.register({
				username: "user1",
				email: "test@example.com",
				password: "password123",
			});

			await expect(
				authService.register({
					username: "user2",
					email: "test@example.com",
					password: "password123",
				}),
			).rejects.toThrow();
		});
	});

	describe("login", () => {
		it("should login with correct credentials", async () => {
			await authService.register({
				username: "testuser",
				email: "test@example.com",
				password: "password123",
			});

			const result = await authService.login({
				email: "test@example.com",
				password: "password123",
			});

			expect(result).toBeTruthy();
			expect(result?.user.email).toBe("test@example.com");
			expect(result?.accessToken).toBeTruthy();
			expect(result?.refreshToken).toBeTruthy();
		});

		it("should reject wrong password", async () => {
			await authService.register({
				username: "testuser",
				email: "test@example.com",
				password: "password123",
			});

			const result = await authService.login({
				email: "test@example.com",
				password: "wrongpassword",
			});

			expect(result).toBeNull();
		});
	});

	describe("refresh token rotation", () => {
		it("should rotate token version on refresh", async () => {
			const registerResult = await authService.register({
				username: "testuser",
				email: "test@example.com",
				password: "password123",
			});

			const refreshResult = await authService.refresh(
				registerResult.refreshToken,
			);

			expect(refreshResult).toBeTruthy();
			expect(refreshResult?.accessToken).toBeTruthy();
			expect(refreshResult?.refreshToken).toBeTruthy();
			expect(refreshResult?.refreshToken).not.toBe(registerResult.refreshToken);
		});

		it("should reject old refresh token after rotation", async () => {
			const registerResult = await authService.register({
				username: "testuser",
				email: "test@example.com",
				password: "password123",
			});

			const oldRefreshToken = registerResult.refreshToken;

			// First refresh - should work
			await authService.refresh(oldRefreshToken);

			// Second refresh with old token - should fail
			const result = await authService.refresh(oldRefreshToken);
			expect(result).toBeNull();
		});
	});
});
