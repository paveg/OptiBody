import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ユーザーテーブル
export const users = sqliteTable("users", {
	id: text("id").primaryKey(),
	email: text("email").unique().notNull(),
	username: text("username").unique().notNull(),
	hashedPassword: text("hashed_password").notNull(),
	createdAt: integer("created_at").default(sql`(unixepoch())`).notNull(),
	updatedAt: integer("updated_at").default(sql`(unixepoch())`).notNull(),
});

// セッションテーブル
export const sessions = sqliteTable("sessions", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	expiresAt: integer("expires_at").notNull(),
});

// ユーザーメトリクステーブル
export const userMetrics = sqliteTable("user_metrics", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	height: real("height"), // cm
	weight: real("weight"), // kg
	age: integer("age"),
	gender: text("gender"),
	activityLevel: text("activity_level"),
	bodyFatPercentage: real("body_fat_percentage"),
	createdAt: integer("created_at").default(sql`(unixepoch())`).notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type UserMetric = typeof userMetrics.$inferSelect;
export type NewUserMetric = typeof userMetrics.$inferInsert;
