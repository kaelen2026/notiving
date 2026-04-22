import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { forbidden, ok, paginated } from "../../lib/api-response.js";
import { parsePagination } from "../../lib/pagination.js";
import { authGuard } from "../../middleware/auth.js";
import type { AppEnv } from "../../types/env.js";
import { updateUserSchema, userIdParam } from "./users.schema.js";
import * as usersService from "./users.service.js";

export const usersRoute = new Hono<AppEnv>();

usersRoute.get("/", async (c) => {
	const { cursor, limit } = parsePagination(c.req.query());
	const result = await usersService.listUsers(cursor, limit);
	return paginated(c, result);
});

usersRoute.get("/:id", zValidator("param", userIdParam), async (c) => {
	const { id } = c.req.valid("param");
	const user = await usersService.getUserById(id);
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
		const user = await usersService.updateUser(id, input);
		c.get("log").info({ targetUserId: id }, "user updated");
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

		await usersService.deleteUser(id);
		c.get("log").info({ targetUserId: id }, "user deleted");
		return ok(c, { deleted: true });
	},
);
