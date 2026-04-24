import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { getDb } from "../../db/index.js";
import { accounts, emailVerificationCodes, users } from "../../db/schema.js";
import * as authService from "./auth.service.js";

describe("Auth Service", () => {
	beforeEach(async () => {
		const db = getDb();
		await db.delete(emailVerificationCodes);
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

	describe("Email OTP", () => {
		it("should send verification code successfully", async () => {
			const result = await authService.sendEmailCode("otp@example.com");
			expect(result.message).toBe("Verification code sent");
		});

		it("should reject sending code within 60 seconds", async () => {
			await authService.sendEmailCode("otp@example.com");
			await expect(
				authService.sendEmailCode("otp@example.com"),
			).rejects.toThrow("Please wait before requesting another code");
		});

		it("should verify code and login existing user", async () => {
			await authService.register({
				username: "existinguser",
				email: "existing@example.com",
				password: "password123",
			});

			await authService.sendEmailCode("existing@example.com");

			const [codeRecord] = await getDb()
				.select()
				.from(emailVerificationCodes)
				.where(eq(emailVerificationCodes.email, "existing@example.com"))
				.limit(1);

			const result = await authService.verifyEmailCode({
				email: "existing@example.com",
				code: codeRecord.code,
			});

			expect(result).toBeTruthy();
			expect(result?.user.email).toBe("existing@example.com");
			expect(result?.accessToken).toBeTruthy();
			expect(result?.refreshToken).toBeTruthy();
		});

		it("should verify code and auto-register new user", async () => {
			await authService.sendEmailCode("newuser@example.com");

			const [codeRecord] = await getDb()
				.select()
				.from(emailVerificationCodes)
				.where(eq(emailVerificationCodes.email, "newuser@example.com"))
				.limit(1);

			const result = await authService.verifyEmailCode({
				email: "newuser@example.com",
				code: codeRecord.code,
			});

			expect(result).toBeTruthy();
			expect(result?.user.email).toBe("newuser@example.com");
			expect(result?.user.username).toMatch(/^user_/);
			expect(result?.accessToken).toBeTruthy();
			expect(result?.refreshToken).toBeTruthy();
		});

		it("should reject invalid code and increment attempts", async () => {
			await authService.sendEmailCode("otp@example.com");

			await expect(
				authService.verifyEmailCode({
					email: "otp@example.com",
					code: "000000",
				}),
			).rejects.toThrow("Invalid verification code");
		});

		it("should reject after 5 failed attempts", async () => {
			await authService.sendEmailCode("otp@example.com");

			for (let i = 0; i < 5; i++) {
				await authService
					.verifyEmailCode({
						email: "otp@example.com",
						code: "000000",
					})
					.catch(() => {});
			}

			await expect(
				authService.verifyEmailCode({
					email: "otp@example.com",
					code: "000000",
				}),
			).rejects.toThrow("Too many attempts, please request a new code");
		});
	});
});
