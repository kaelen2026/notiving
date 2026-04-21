import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ZodError } from "zod";
import type { PaginatedResult } from "./pagination.js";

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
}

export function ok<T>(c: Context, data: T, status: ContentfulStatusCode = 200) {
	return c.json<ApiResponse<T>>({ success: true, data }, status);
}

export function created<T>(c: Context, data: T) {
	return ok(c, data, 201);
}

export function paginated<T>(c: Context, result: PaginatedResult<T>) {
	return c.json<ApiResponse<PaginatedResult<T>>>({
		success: true,
		data: result,
	});
}

export function fail(
	c: Context,
	message: string,
	status: ContentfulStatusCode = 400,
) {
	return c.json<ApiResponse>({ success: false, error: message }, status);
}

export function formatZodError(error: ZodError) {
	return error.issues
		.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
		.join("; ");
}

export function notFound(message = "Resource not found") {
	throw new HTTPException(404, { message });
}

export function forbidden(message = "Forbidden") {
	throw new HTTPException(403, { message });
}

export function conflict(message: string) {
	throw new HTTPException(409, { message });
}
