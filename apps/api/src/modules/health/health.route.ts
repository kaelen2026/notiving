import { Hono } from "hono";
import { db } from "../../db/index.js";
import { logger } from "../../lib/logger.js";

export const healthRoute = new Hono();

healthRoute.get("/", async (c) => {
	const checks: Record<string, string> = {
		status: "ok",
	};

	// Check database connection
	try {
		await db.execute("SELECT 1");
		checks.database = "ok";
	} catch (err) {
		logger.error({ err }, "Database health check failed");
		checks.database = "error";
		checks.databaseError = err instanceof Error ? err.message : "Unknown error";
	}

	const allHealthy = Object.values(checks).every((v) => v === "ok");
	const status = allHealthy ? 200 : 503;

	return c.json({ success: allHealthy, data: checks }, status);
});
