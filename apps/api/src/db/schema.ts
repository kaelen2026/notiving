import {
	boolean,
	foreignKey,
	integer,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey(),
	username: varchar({ length: 32 }).unique(),
	email: varchar({ length: 255 }).unique(),
	password: varchar({ length: 255 }),
	displayName: varchar("display_name", { length: 64 }),
	bio: text(),
	avatarUrl: varchar("avatar_url", { length: 512 }),
	isAnonymous: boolean("is_anonymous").notNull().default(false),
	tokenVersion: varchar("token_version", { length: 36 }).notNull().default("0"),
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

export const accounts = pgTable(
	"accounts",
	{
		id: uuid().defaultRandom().primaryKey(),
		userId: uuid("user_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
		provider: varchar({ length: 32 }).notNull(),
		providerUserId: varchar("provider_user_id", { length: 255 }).notNull(),
		email: varchar({ length: 255 }),
		displayName: varchar("display_name", { length: 64 }),
		avatarUrl: varchar("avatar_url", { length: 512 }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		expiresAt: timestamp("expires_at"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [unique().on(table.provider, table.providerUserId)],
);

export const oauthStates = pgTable("oauth_states", {
	id: uuid().defaultRandom().primaryKey(),
	state: varchar({ length: 128 }).unique().notNull(),
	codeVerifier: varchar("code_verifier", { length: 128 }),
	nonce: varchar({ length: 128 }),
	provider: varchar({ length: 32 }).notNull(),
	deviceType: varchar("device_type", { length: 16 }).notNull(),
	redirectUri: varchar("redirect_uri", { length: 512 }),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailVerificationCodes = pgTable("email_verification_codes", {
	id: uuid().defaultRandom().primaryKey(),
	email: varchar({ length: 255 }).notNull(),
	code: varchar({ length: 6 }).notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	attempts: integer().notNull().default(0),
	used: boolean().notNull().default(false),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
