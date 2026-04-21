import type { ErrorHandler, NotFoundHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ApiResponse } from "../lib/api-response.js";

export const errorHandler: ErrorHandler = (err, c) => {
	const status = "status" in err ? (err.status as number) : 500;
	const message =
		status === 500 ? "Internal Server Error" : err.message || "Unknown error";

	if (status === 500) {
		console.error(err);
	}

	return c.json<ApiResponse>(
		{ success: false, error: message },
		status as ContentfulStatusCode,
	);
};

export const notFoundHandler: NotFoundHandler = (c) => {
	return c.json<ApiResponse>(
		{ success: false, error: `Not Found: ${c.req.path}` },
		404,
	);
};
