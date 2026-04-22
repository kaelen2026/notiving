import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { created, forbidden, ok, paginated } from "../../lib/api-response.js";
import { parsePagination } from "../../lib/pagination.js";
import { authGuard } from "../../middleware/auth.js";
import type { AppEnv } from "../../types/env.js";
import * as handler from "./comments.handler.js";
import {
	commentIdParam,
	createCommentSchema,
	updateCommentSchema,
} from "./comments.schema.js";

export const commentsRoute = new Hono<AppEnv>();

commentsRoute.get("/", async (c) => {
	const { cursor, limit } = parsePagination(c.req.query());
	const postId = c.req.query("postId");
	const parentId = c.req.query("parentId");
	const result = await handler.listComments(cursor, limit, postId, parentId);
	return paginated(c, result);
});

commentsRoute.get("/:id", zValidator("param", commentIdParam), async (c) => {
	const { id } = c.req.valid("param");
	const comment = await handler.getCommentById(id);
	return ok(c, comment);
});

commentsRoute.post(
	"/",
	authGuard,
	zValidator("json", createCommentSchema),
	async (c) => {
		const userId = c.get("userId");
		const input = c.req.valid("json");
		const comment = await handler.createComment(userId, input);
		c.get("log").info({ commentId: comment.id }, "comment created");
		return created(c, comment);
	},
);

commentsRoute.put(
	"/:id",
	authGuard,
	zValidator("param", commentIdParam),
	zValidator("json", updateCommentSchema),
	async (c) => {
		const { id } = c.req.valid("param");
		const userId = c.get("userId");

		const existing = await handler.getCommentById(id);
		if (existing?.authorId !== userId) {
			return forbidden("You can only update your own comments");
		}

		const input = c.req.valid("json");
		const comment = await handler.updateComment(id, input);
		c.get("log").info({ commentId: id }, "comment updated");
		return ok(c, comment);
	},
);

commentsRoute.delete(
	"/:id",
	authGuard,
	zValidator("param", commentIdParam),
	async (c) => {
		const { id } = c.req.valid("param");
		const userId = c.get("userId");

		const existing = await handler.getCommentById(id);
		if (existing?.authorId !== userId) {
			return forbidden("You can only delete your own comments");
		}

		await handler.deleteComment(id);
		c.get("log").info({ commentId: id }, "comment deleted");
		return ok(c, { deleted: true });
	},
);
