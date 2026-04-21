import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { rateLimiter } from "./middleware/rate-limit.js";
import { authRoute } from "./modules/auth/auth.route.js";
import { commentsRoute } from "./modules/comments/comments.route.js";
import { healthRoute } from "./modules/health/health.route.js";
import { postsRoute } from "./modules/posts/posts.route.js";
import { usersRoute } from "./modules/users/users.route.js";

const app = new Hono();

app.use(logger());
app.use(
	cors(
		env.CORS_ORIGIN.length > 0 ? { origin: env.CORS_ORIGIN } : undefined,
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
