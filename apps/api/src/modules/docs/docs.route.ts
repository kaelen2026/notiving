import { Hono } from "hono";

export const docsRoute = new Hono();

const openApiSpec = {
	openapi: "3.1.0",
	info: {
		title: "Notiving API",
		version: "0.1.0",
		description: "REST API for Notiving - your space to share and connect",
	},
	servers: [
		{
			url: "http://localhost:3001",
			description: "Development server",
		},
	],
	components: {
		securitySchemes: {
			bearerAuth: {
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
			},
		},
		schemas: {
			ApiResponse: {
				type: "object",
				properties: {
					success: { type: "boolean" },
					data: { type: "object" },
					error: { type: "string" },
				},
			},
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
	paths: {
		"/health": {
			get: {
				summary: "Health check",
				tags: ["System"],
				responses: {
					"200": {
						description: "Service is healthy",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ApiResponse" },
							},
						},
					},
				},
			},
		},
		"/api/v1/auth/register": {
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
									username: { type: "string", minLength: 3, maxLength: 32 },
									email: { type: "string", format: "email" },
									password: { type: "string", minLength: 8 },
									displayName: { type: "string", maxLength: 64 },
								},
							},
						},
					},
				},
				responses: {
					"201": { description: "User registered successfully" },
					"400": { description: "Validation error" },
					"409": { description: "Email or username already exists" },
				},
			},
		},
		"/api/v1/auth/login": {
			post: {
				summary: "Login user",
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
		"/api/v1/auth/me": {
			get: {
				summary: "Get current user",
				tags: ["Auth"],
				security: [{ bearerAuth: [] }],
				responses: {
					"200": {
						description: "Current user info",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/User" },
							},
						},
					},
					"401": { description: "Unauthorized" },
				},
			},
		},
		"/api/v1/users": {
			get: {
				summary: "List users",
				tags: ["Users"],
				parameters: [
					{
						name: "cursor",
						in: "query",
						schema: { type: "string" },
					},
					{
						name: "limit",
						in: "query",
						schema: { type: "integer", default: 20, maximum: 100 },
					},
				],
				responses: {
					"200": { description: "List of users" },
				},
			},
		},
		"/api/v1/posts": {
			get: {
				summary: "List posts",
				tags: ["Posts"],
				parameters: [
					{
						name: "cursor",
						in: "query",
						schema: { type: "string" },
					},
					{
						name: "limit",
						in: "query",
						schema: { type: "integer", default: 20, maximum: 100 },
					},
					{
						name: "authorId",
						in: "query",
						schema: { type: "string", format: "uuid" },
					},
				],
				responses: {
					"200": { description: "List of posts" },
				},
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
									title: { type: "string", maxLength: 256 },
									content: { type: "string" },
									slug: {
										type: "string",
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
	},
	tags: [
		{ name: "System", description: "System health and status" },
		{ name: "Auth", description: "Authentication endpoints" },
		{ name: "Users", description: "User management" },
		{ name: "Posts", description: "Post management" },
		{ name: "Comments", description: "Comment management" },
	],
};

docsRoute.get("/openapi.json", (c) => {
	return c.json(openApiSpec);
});

docsRoute.get("/", (c) => {
	return c.html(`
<!DOCTYPE html>
<html>
<head>
  <title>Notiving API Documentation</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body {
      margin: 0;
      padding: 0;
    }
  </style>
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
