import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { forbidden, ok, paginated } from "../../lib/api-response.js";
import { parsePagination } from "../../lib/pagination.js";
import { authGuard } from "../../middleware/auth.js";
import type { AppEnv } from "../../types/env.js";
import * as handler from "./users.handler.js";
import { updateUserSchema, userIdParam } from "./users.schema.js";

export const usersRoute = new Hono<AppEnv>();

usersRoute.get("/", async (c) => {
	const { cursor, limit } = parsePagination(c.req.query());
	const result = await handler.listUsers(cursor, limit);
	return paginated(c, result);
});

usersRoute.get("/:id", zValidator("param", userIdParam), async (c) => {
	const { id } = c.req.valid("param");
	const user = await handler.getUserById(id);
	return ok(c, user);
});

usersRoute.put(
	"/:id",
	authGuard,
	zValidator("param", userIdParam),
	zValidator("json", updateUserSchema),
	async (c) => {
		const { id } = c.req.valid("param");
		const userId = c.get("userId");
		if (id !== userId) return forbidden("You can only update your own profile");

		const input = c.req.valid("json");
		const user = await handler.updateUser(id, input);
		return ok(c, user);
	},
);

usersRoute.delete(
	"/:id",
	authGuard,
	zValidator("param", userIdParam),
	async (c) => {
		const { id } = c.req.valid("param");
		const userId = c.get("userId");
		if (id !== userId) return forbidden("You can only delete your own account");

		await handler.deleteUser(id);
		return ok(c, { deleted: true });
	},
);
