import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { created, forbidden, ok, paginated } from "../../lib/api-response.js";
import { parsePagination } from "../../lib/pagination.js";
import { authGuard } from "../../middleware/auth.js";
import type { AppEnv } from "../../types/env.js";
import * as handler from "./posts.handler.js";
import {
	createPostSchema,
	postIdParam,
	updatePostSchema,
} from "./posts.schema.js";

export const postsRoute = new Hono<AppEnv>();

postsRoute.get("/", async (c) => {
	const { cursor, limit } = parsePagination(c.req.query());
	const authorId = c.req.query("authorId");
	const result = await handler.listPosts(cursor, limit, authorId);
	return paginated(c, result);
});

postsRoute.get("/:id", zValidator("param", postIdParam), async (c) => {
	const { id } = c.req.valid("param");
	const post = await handler.getPostById(id);
	return ok(c, post);
});

postsRoute.post(
	"/",
	authGuard,
	zValidator("json", createPostSchema),
	async (c) => {
		const userId = c.get("userId");
		const input = c.req.valid("json");
		const post = await handler.createPost(userId, input);
		c.get("log").info({ postId: post.id }, "post created");
		return created(c, post);
	},
);

postsRoute.put(
	"/:id",
	authGuard,
	zValidator("param", postIdParam),
	zValidator("json", updatePostSchema),
	async (c) => {
		const { id } = c.req.valid("param");
		const userId = c.get("userId");

		const existing = await handler.getPostById(id);
		if (existing?.authorId !== userId) {
			return forbidden("You can only update your own posts");
		}

		const input = c.req.valid("json");
		const post = await handler.updatePost(id, input);
		c.get("log").info({ postId: id }, "post updated");
		return ok(c, post);
	},
);

postsRoute.delete(
	"/:id",
	authGuard,
	zValidator("param", postIdParam),
	async (c) => {
		const { id } = c.req.valid("param");
		const userId = c.get("userId");

		const existing = await handler.getPostById(id);
		if (existing?.authorId !== userId) {
			return forbidden("You can only delete your own posts");
		}

		await handler.deletePost(id);
		c.get("log").info({ postId: id }, "post deleted");
		return ok(c, { deleted: true });
	},
);
