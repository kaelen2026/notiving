import {
	boolean,
	foreignKey,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey(),
	username: varchar({ length: 32 }).unique().notNull(),
	email: varchar({ length: 255 }).unique().notNull(),
	password: varchar({ length: 255 }).notNull(),
	displayName: varchar("display_name", { length: 64 }),
	bio: text(),
	avatarUrl: varchar("avatar_url", { length: 512 }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
	id: uuid().defaultRandom().primaryKey(),
	title: varchar({ length: 256 }).notNull(),
	content: text().notNull(),
	slug: varchar({ length: 256 }).unique().notNull(),
	published: boolean().default(false).notNull(),
	authorId: uuid("author_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const comments = pgTable(
	"comments",
	{
		id: uuid().defaultRandom().primaryKey(),
		content: text().notNull(),
		postId: uuid("post_id")
			.references(() => posts.id, { onDelete: "cascade" })
			.notNull(),
		authorId: uuid("author_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
		parentId: uuid("parent_id"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
		}).onDelete("cascade"),
	],
);
