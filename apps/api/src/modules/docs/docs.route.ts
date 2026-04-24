import { Hono } from "hono";

export const docsRoute = new Hono();

const paginationParams = [
	{ name: "cursor", in: "query", schema: { type: "string" } },
	{
		name: "limit",
		in: "query",
		schema: { type: "integer", default: 20, maximum: 100 },
	},
];

const openApiSpec = {
	openapi: "3.1.0",
	info: {
		title: "Notiving API",
		version: "0.1.0",
		description: "REST API for Notiving",
	},
	servers: [
		{ url: "http://localhost:3001", description: "Development server" },
	],
	components: {
		securitySchemes: {
			bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
		},
		schemas: {
			User: {
				type: "object",
				properties: {
					id: { type: "string", format: "uuid" },
					username: { type: "string" },
					displayName: { type: "string", nullable: true },
					bio: { type: "string", nullable: true },
					avatarUrl: { type: "string", nullable: true },
					createdAt: { type: "string", format: "date-time" },
					updatedAt: { type: "string", format: "date-time" },
				},
			},
			Post: {
				type: "object",
				properties: {
					id: { type: "string", format: "uuid" },
					title: { type: "string" },
					content: { type: "string" },
					slug: { type: "string" },
					published: { type: "boolean" },
					authorId: { type: "string", format: "uuid" },
					createdAt: { type: "string", format: "date-time" },
					updatedAt: { type: "string", format: "date-time" },
				},
			},
			Comment: {
				type: "object",
				properties: {
					id: { type: "string", format: "uuid" },
					content: { type: "string" },
					postId: { type: "string", format: "uuid" },
					authorId: { type: "string", format: "uuid" },
					parentId: { type: "string", format: "uuid", nullable: true },
					createdAt: { type: "string", format: "date-time" },
					updatedAt: { type: "string", format: "date-time" },
				},
			},
		},
	},
	tags: [
		{ name: "System" },
		{ name: "Auth" },
		{ name: "OAuth" },
		{ name: "Users" },
		{ name: "Posts" },
		{ name: "Comments" },
	],
	paths: {
		"/health": {
			get: {
				summary: "Health check",
				tags: ["System"],
				responses: {
					"200": { description: "Healthy" },
					"503": { description: "Unhealthy" },
				},
			},
		},
		"/v1/auth/register": {
			post: {
				summary: "Register new user",
				tags: ["Auth"],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["username", "email", "password"],
								properties: {
									username: {
										type: "string",
										minLength: 3,
										maxLength: 32,
										pattern: "^[a-zA-Z0-9_-]+$",
									},
									email: { type: "string", format: "email", maxLength: 255 },
									password: { type: "string", minLength: 8, maxLength: 128 },
									displayName: { type: "string", maxLength: 64 },
								},
							},
						},
					},
				},
				responses: {
					"201": { description: "User registered" },
					"400": { description: "Validation error" },
					"409": { description: "Email or username taken" },
				},
			},
		},
		"/v1/auth/login": {
			post: {
				summary: "Login with email and password",
				tags: ["Auth"],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["email", "password"],
								properties: {
									email: { type: "string", format: "email" },
									password: { type: "string" },
								},
							},
						},
					},
				},
				responses: {
					"200": { description: "Login successful" },
					"401": { description: "Invalid credentials" },
				},
			},
		},
		"/v1/auth/refresh": {
			post: {
				summary: "Refresh access token",
				tags: ["Auth"],
				description:
					"Web clients send refresh token via httpOnly cookie. Native clients send it in the JSON body.",
				requestBody: {
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: { refreshToken: { type: "string" } },
							},
						},
					},
				},
				responses: {
					"200": { description: "New token pair" },
					"401": { description: "Invalid or expired refresh token" },
				},
			},
		},
		"/v1/auth/logout": {
			post: {
				summary: "Logout (invalidate refresh tokens)",
				tags: ["Auth"],
				security: [{ bearerAuth: [] }],
				responses: {
					"200": { description: "Logged out" },
					"401": { description: "Unauthorized" },
				},
			},
		},
		"/v1/auth/me": {
			get: {
				summary: "Get current user profile",
				tags: ["Auth"],
				security: [{ bearerAuth: [] }],
				responses: {
					"200": { description: "Current user with linked providers" },
					"401": { description: "Unauthorized" },
					"404": { description: "User not found" },
				},
			},
		},
		"/v1/auth/email/send-code": {
			post: {
				summary: "Send email verification code",
				tags: ["Auth"],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["email"],
								properties: {
									email: { type: "string", format: "email", maxLength: 255 },
								},
							},
						},
					},
				},
				responses: {
					"200": { description: "Code sent" },
					"429": { description: "Rate limited" },
				},
			},
		},
		"/v1/auth/email/verify-code": {
			post: {
				summary: "Verify email code and login/register",
				tags: ["Auth"],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["email", "code"],
								properties: {
									email: { type: "string", format: "email", maxLength: 255 },
									code: {
										type: "string",
										pattern: "^\\d{6}$",
										minLength: 6,
										maxLength: 6,
									},
								},
							},
						},
					},
				},
				responses: {
					"200": { description: "Login successful" },
					"400": { description: "Invalid or expired code" },
					"401": { description: "Unauthorized" },
				},
			},
		},
		"/v1/auth/anonymous": {
			post: {
				summary: "Create anonymous user",
				tags: ["OAuth"],
				responses: {
					"201": { description: "Anonymous user created with tokens" },
				},
			},
		},
		"/v1/auth/oauth/{provider}": {
			get: {
				summary: "Initiate OAuth flow",
				tags: ["OAuth"],
				parameters: [
					{
						name: "provider",
						in: "path",
						required: true,
						schema: { type: "string", enum: ["google", "apple"] },
					},
					{
						name: "redirect_uri",
						in: "query",
						schema: { type: "string", format: "uri", maxLength: 512 },
					},
				],
				responses: {
					"200": { description: "Authorization URL (native)" },
					"302": { description: "Redirect to provider (web)" },
					"400": { description: "Unsupported provider" },
				},
			},
		},
		"/v1/auth/oauth/{provider}/callback": {
			get: {
				summary: "OAuth callback (GET)",
				tags: ["OAuth"],
				parameters: [
					{
						name: "provider",
						in: "path",
						required: true,
						schema: { type: "string", enum: ["google", "apple"] },
					},
					{
						name: "code",
						in: "query",
						required: true,
						schema: { type: "string" },
					},
					{
						name: "state",
						in: "query",
						required: true,
						schema: { type: "string" },
					},
				],
				responses: {
					"200": { description: "Login successful" },
					"302": { description: "Redirect with tokens" },
					"400": { description: "Invalid state or code" },
				},
			},
			post: {
				summary: "OAuth callback (POST, used by Apple)",
				tags: ["OAuth"],
				requestBody: {
					required: true,
					content: {
						"application/x-www-form-urlencoded": {
							schema: {
								type: "object",
								required: ["code", "state"],
								properties: {
									code: { type: "string" },
									state: { type: "string" },
									user: { type: "string" },
								},
							},
						},
					},
				},
				responses: {
					"200": { description: "Login successful" },
					"302": { description: "Redirect with tokens" },
					"400": { description: "Invalid state or code" },
				},
			},
		},
		"/v1/auth/oauth/{provider}/token": {
			post: {
				summary: "Exchange OAuth code for tokens (native clients)",
				tags: ["OAuth"],
				parameters: [
					{
						name: "provider",
						in: "path",
						required: true,
						schema: { type: "string", enum: ["google", "apple"] },
					},
				],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["code"],
								properties: {
									code: { type: "string" },
									codeVerifier: { type: "string" },
									nonce: { type: "string" },
									user: {
										type: "object",
										properties: {
											firstName: { type: "string" },
											lastName: { type: "string" },
										},
									},
								},
							},
						},
					},
				},
				responses: {
					"200": { description: "Tokens returned" },
					"400": { description: "Invalid code or missing codeVerifier" },
				},
			},
		},
		"/v1/auth/link-password": {
			post: {
				summary: "Link password to OAuth-only account",
				tags: ["OAuth"],
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["password"],
								properties: {
									password: { type: "string", minLength: 8, maxLength: 128 },
								},
							},
						},
					},
				},
				responses: {
					"200": { description: "Password set" },
					"401": { description: "Unauthorized" },
					"404": { description: "User not found" },
					"409": { description: "Password already set" },
				},
			},
		},
		"/v1/users": {
			get: {
				summary: "List users",
				tags: ["Users"],
				parameters: paginationParams,
				responses: { "200": { description: "Paginated list of users" } },
			},
		},
		"/v1/users/{id}": {
			get: {
				summary: "Get user by ID",
				tags: ["Users"],
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				responses: { "200": { description: "User details" } },
			},
			put: {
				summary: "Update user profile",
				tags: ["Users"],
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									displayName: { type: "string", maxLength: 64 },
									bio: { type: "string", maxLength: 500 },
									avatarUrl: { type: "string", format: "uri", maxLength: 512 },
								},
							},
						},
					},
				},
				responses: {
					"200": { description: "User updated" },
					"401": { description: "Unauthorized" },
					"403": { description: "Can only update own profile" },
				},
			},
			delete: {
				summary: "Delete user account",
				tags: ["Users"],
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				responses: {
					"200": { description: "User deleted" },
					"401": { description: "Unauthorized" },
					"403": { description: "Can only delete own account" },
				},
			},
		},
		"/v1/posts": {
			get: {
				summary: "List posts",
				tags: ["Posts"],
				parameters: [
					...paginationParams,
					{
						name: "authorId",
						in: "query",
						schema: { type: "string", format: "uuid" },
					},
				],
				responses: { "200": { description: "Paginated list of posts" } },
			},
			post: {
				summary: "Create post",
				tags: ["Posts"],
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["title", "content", "slug"],
								properties: {
									title: { type: "string", minLength: 1, maxLength: 256 },
									content: { type: "string", minLength: 1 },
									slug: {
										type: "string",
										minLength: 1,
										maxLength: 256,
										pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
									},
									published: { type: "boolean" },
								},
							},
						},
					},
				},
				responses: {
					"201": { description: "Post created" },
					"401": { description: "Unauthorized" },
				},
			},
		},
		"/v1/posts/{id}": {
			get: {
				summary: "Get post by ID",
				tags: ["Posts"],
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				responses: { "200": { description: "Post details" } },
			},
			put: {
				summary: "Update post",
				tags: ["Posts"],
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									title: { type: "string", minLength: 1, maxLength: 256 },
									content: { type: "string", minLength: 1 },
									slug: {
										type: "string",
										minLength: 1,
										maxLength: 256,
										pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
									},
									published: { type: "boolean" },
								},
							},
						},
					},
				},
				responses: {
					"200": { description: "Post updated" },
					"401": { description: "Unauthorized" },
					"403": { description: "Can only update own posts" },
				},
			},
			delete: {
				summary: "Delete post",
				tags: ["Posts"],
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				responses: {
					"200": { description: "Post deleted" },
					"401": { description: "Unauthorized" },
					"403": { description: "Can only delete own posts" },
				},
			},
		},
		"/v1/comments": {
			get: {
				summary: "List comments",
				tags: ["Comments"],
				parameters: [
					...paginationParams,
					{
						name: "postId",
						in: "query",
						schema: { type: "string", format: "uuid" },
					},
					{
						name: "parentId",
						in: "query",
						schema: { type: "string", format: "uuid" },
					},
				],
				responses: { "200": { description: "Paginated list of comments" } },
			},
			post: {
				summary: "Create comment",
				tags: ["Comments"],
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["content", "postId"],
								properties: {
									content: { type: "string", minLength: 1, maxLength: 2000 },
									postId: { type: "string", format: "uuid" },
									parentId: { type: "string", format: "uuid" },
								},
							},
						},
					},
				},
				responses: {
					"201": { description: "Comment created" },
					"401": { description: "Unauthorized" },
				},
			},
		},
		"/v1/comments/{id}": {
			get: {
				summary: "Get comment by ID",
				tags: ["Comments"],
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				responses: { "200": { description: "Comment details" } },
			},
			put: {
				summary: "Update comment",
				tags: ["Comments"],
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["content"],
								properties: {
									content: { type: "string", minLength: 1, maxLength: 2000 },
								},
							},
						},
					},
				},
				responses: {
					"200": { description: "Comment updated" },
					"401": { description: "Unauthorized" },
					"403": { description: "Can only update own comments" },
				},
			},
			delete: {
				summary: "Delete comment",
				tags: ["Comments"],
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				responses: {
					"200": { description: "Comment deleted" },
					"401": { description: "Unauthorized" },
					"403": { description: "Can only delete own comments" },
				},
			},
		},
	} as Record<string, unknown>,
};

docsRoute.get("/openapi.json", (c) => c.json(openApiSpec));

docsRoute.get("/", (c) => {
	return c.html(`
<!DOCTYPE html>
<html>
<head>
  <title>Notiving API Documentation</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>body { margin: 0; padding: 0; }</style>
</head>
<body>
  <script
    id="api-reference"
    data-url="/docs/openapi.json"
    data-configuration='{"theme":"purple","layout":"modern","defaultHttpClient":{"targetKey":"javascript","clientKey":"fetch"}}'></script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>
  `);
});
