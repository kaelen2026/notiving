import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { getEnv } from "../config/env.js";
import * as schema from "./schema.js";

let _db: NeonHttpDatabase<typeof schema> | null = null;

export function getDb(): NeonHttpDatabase<typeof schema> {
	if (!_db) {
		const sql = neon(getEnv().DATABASE_URL);
		_db = drizzle(sql, { schema });
	}
	return _db;
}
