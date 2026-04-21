import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { rateLimiter } from "./middleware/rate-limit.js";
import { authRoute } from "./modules/auth/auth.route.js";
import { commentsRoute } from "./modules/comments/comments.route.js";
import { healthRoute } from "./modules/health/health.route.js";
import { postsRoute } from "./modules/posts/posts.route.js";
import { usersRoute } from "./modules/users/users.route.js";

const allowedOrigins = process.env.CORS_ORIGIN?.split(",").map((o) =>
	o.trim(),
);

const app = new Hono();

app.use(logger());
app.use(
	cors(
		allowedOrigins && allowedOrigins.length > 0
			? { origin: allowedOrigins }
			: undefined,
	),
);
app.use(prettyJSON());

app.onError(errorHandler);
app.notFound(notFoundHandler);

app.route("/health", healthRoute);
app.use("/api/v1/auth/*", rateLimiter({ windowMs: 60_000, max: 10 }));
app.route("/api/v1/auth", authRoute);
app.route("/api/v1/users", usersRoute);
app.route("/api/v1/posts", postsRoute);
app.route("/api/v1/comments", commentsRoute);

export default app;
