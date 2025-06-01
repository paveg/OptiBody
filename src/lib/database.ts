import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./database/schema";
import { env } from "./env";

// PostgreSQL接続の作成
const client = postgres(env.DATABASE_URL, {
	max: 10,
	idle_timeout: 20,
	connect_timeout: 10,
});

// Drizzle ORMインスタンスの作成
export const db = drizzle(client, {
	schema,
	logger: env.NODE_ENV === "development",
});

export default db;
