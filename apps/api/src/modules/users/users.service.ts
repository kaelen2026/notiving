import { notFound } from "../../lib/api-response.js";
import { toPaginatedResult } from "../../lib/pagination.js";
import * as repo from "./users.repository.js";
import type { UpdateUserInput } from "./users.schema.js";

export async function listUsers(cursor: string | undefined, limit: number) {
	const rows = await repo.listUsers(cursor, limit);
	return toPaginatedResult(rows, limit);
}

export async function getUserById(id: string) {
	const user = await repo.findUserById(id);
	if (!user) notFound("User not found");
	return user;
}

export async function updateUser(id: string, input: UpdateUserInput) {
	const user = await repo.updateUser(id, input);
	if (!user) notFound("User not found");
	return user;
}

export async function deleteUser(id: string) {
	const user = await repo.deleteUser(id);
	if (!user) notFound("User not found");
}
