import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/api/init-db")({
	POST: async ({ request, context }) => {
		try {
			// アプリケーションが使用しているD1インスタンスを取得
			const d1Instance = globalThis.__env__?.DB || globalThis.DB;

			if (!d1Instance) {
				return new Response(
					JSON.stringify({
						success: false,
						error: "D1 database not available",
					}),
					{
						status: 503,
						headers: { "Content-Type": "application/json" },
					},
				);
			}

			// スキーマを直接実行
			const createUsersTable = `
				CREATE TABLE IF NOT EXISTS users (
					id text PRIMARY KEY NOT NULL,
					email text NOT NULL,
					username text NOT NULL,
					hashed_password text NOT NULL,
					created_at integer DEFAULT (unixepoch()) NOT NULL,
					updated_at integer DEFAULT (unixepoch()) NOT NULL
				);
			`;

			const createSessionsTable = `
				CREATE TABLE IF NOT EXISTS sessions (
					id text PRIMARY KEY NOT NULL,
					user_id text NOT NULL,
					expires_at integer NOT NULL,
					FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
				);
			`;

			const createUserMetricsTable = `
				CREATE TABLE IF NOT EXISTS user_metrics (
					id text PRIMARY KEY NOT NULL,
					user_id text NOT NULL,
					height real,
					weight real,
					age integer,
					gender text,
					activity_level text,
					body_fat_percentage real,
					created_at integer DEFAULT (unixepoch()) NOT NULL,
					FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
				);
			`;

			const createUsersEmailIndex = `
				CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email);
			`;

			const createUsersUsernameIndex = `
				CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users (username);
			`;

			// 各テーブルを作成
			await d1Instance.prepare(createUsersTable).run();
			await d1Instance.prepare(createSessionsTable).run();
			await d1Instance.prepare(createUserMetricsTable).run();
			await d1Instance.prepare(createUsersEmailIndex).run();
			await d1Instance.prepare(createUsersUsernameIndex).run();

			// 検証: テーブルが作成されたか確認
			const tablesResult = await d1Instance
				.prepare(
					"SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users', 'sessions', 'user_metrics')",
				)
				.all();

			return new Response(
				JSON.stringify({
					success: true,
					message: "Database schema initialized successfully",
					tables_created: tablesResult.results.map((t: any) => t.name),
					tables_count: tablesResult.results.length,
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				},
			);
		} catch (error) {
			return new Response(
				JSON.stringify({
					success: false,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}
	},
});
