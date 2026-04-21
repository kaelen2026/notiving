import { gt, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

export interface PaginationParams {
	cursor?: string;
	limit?: number;
}

export interface PaginatedResult<T> {
	items: T[];
	nextCursor: string | null;
	hasMore: boolean;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function parsePagination(query: { cursor?: string; limit?: string }): {
	cursor: string | undefined;
	limit: number;
} {
	const limit = Math.min(
		Math.max(Number(query.limit) || DEFAULT_LIMIT, 1),
		MAX_LIMIT,
	);
	return { cursor: query.cursor || undefined, limit };
}

export function buildCursorCondition(
	cursorColumn: PgColumn,
	cursor: string | undefined,
): SQL | undefined {
	if (!cursor) return undefined;
	return gt(cursorColumn, cursor);
}

export function toPaginatedResult<T extends { id: string }>(
	rows: T[],
	limit: number,
): PaginatedResult<T> {
	const hasMore = rows.length > limit;
	const items = hasMore ? rows.slice(0, limit) : rows;
	const nextCursor = hasMore ? items[items.length - 1].id : null;
	return { items, nextCursor, hasMore };
}
