import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
	console.log("Seeding database...");

	const [user] = await db
		.insert(schema.users)
		.values({
			username: "seed_author",
			email: "seed@notiving.com",
			displayName: "Seed Author",
			bio: "A test user for seeding posts.",
		})
		.onConflictDoUpdate({
			target: schema.users.username,
			set: { displayName: "Seed Author" },
		})
		.returning();

	const posts = [
		{
			title: "Getting Started with Notiving",
			slug: "getting-started-with-notiving",
			content:
				"Welcome to Notiving! This is a quick guide to help you get up and running with the platform. We cover the basics of creating your first post, customizing your profile, and connecting with other users.",
			published: true,
		},
		{
			title: "10 Tips for Better Writing",
			slug: "10-tips-for-better-writing",
			content:
				"Writing well is a skill that improves with practice. Here are ten practical tips: start with an outline, write a rough first draft, cut unnecessary words, use active voice, read your work aloud, get feedback from others, revise multiple times, study great writers, write every day, and embrace imperfection.",
			published: true,
		},
		{
			title: "Understanding Markdown Syntax",
			slug: "understanding-markdown-syntax",
			content:
				"Markdown is a lightweight markup language. Use # for headings, ** for bold, * for italic, - for lists, and ``` for code blocks. It is widely supported across platforms and makes formatting text simple and readable.",
			published: true,
		},
		{
			title: "The Future of Web Development",
			slug: "the-future-of-web-development",
			content:
				"Web development continues to evolve rapidly. Server components, edge computing, and AI-assisted coding are reshaping how we build applications. Frameworks are getting faster, tooling is getting smarter, and the line between frontend and backend keeps blurring.",
			published: true,
		},
		{
			title: "Why TypeScript Changes Everything",
			slug: "why-typescript-changes-everything",
			content:
				"TypeScript adds static typing to JavaScript, catching bugs at compile time instead of runtime. With strict mode enabled, you get exhaustive type checking, better IDE support, and self-documenting code that scales across large teams.",
			published: true,
		},
		{
			title: "Building REST APIs with Hono",
			slug: "building-rest-apis-with-hono",
			content:
				"Hono is an ultrafast web framework that runs everywhere — Cloudflare Workers, Deno, Bun, and Node.js. Its middleware system, type-safe routing, and tiny bundle size make it a great choice for modern API development.",
			published: true,
		},
		{
			title: "A Guide to Cursor-Based Pagination",
			slug: "a-guide-to-cursor-based-pagination",
			content:
				"Offset pagination breaks at scale because inserting or deleting rows shifts the entire result set. Cursor-based pagination uses a stable pointer — typically a timestamp or ID — to fetch the next page, giving consistent results even as data changes.",
			published: true,
		},
		{
			title: "Drizzle ORM: Type-Safe SQL for TypeScript",
			slug: "drizzle-orm-type-safe-sql",
			content:
				"Drizzle ORM provides a SQL-like query builder with full TypeScript inference. Unlike heavier ORMs, it has zero runtime dependencies, supports all major databases, and lets you write queries that look and feel like actual SQL.",
			published: true,
		},
		{
			title: "Designing Minimal UIs",
			slug: "designing-minimal-uis",
			content:
				"A minimal UI strips away everything that does not serve the user. Generous whitespace, a restrained color palette, clear typography hierarchy, and subtle shadows create interfaces that feel calm and focused.",
			published: true,
		},
		{
			title: "Tailwind CSS v4: What Changed",
			slug: "tailwind-css-v4-what-changed",
			content:
				"Tailwind v4 moves configuration from JavaScript to CSS with the @theme directive. The new engine is faster, the output is smaller, and CSS-first config means your design tokens live right next to your styles.",
			published: true,
		},
		{
			title: "Monorepos with Turborepo",
			slug: "monorepos-with-turborepo",
			content:
				"Turborepo orchestrates builds across multiple packages in a single repository. Its task pipeline, remote caching, and incremental builds cut CI times dramatically while keeping code organization clean.",
			published: true,
		},
		{
			title: "JWT Authentication Explained",
			slug: "jwt-authentication-explained",
			content:
				"JSON Web Tokens encode user identity into a signed, stateless token. Short-lived access tokens paired with longer-lived refresh tokens balance security and user experience without server-side session storage.",
			published: true,
		},
		{
			title: "Edge Computing for API Developers",
			slug: "edge-computing-for-api-developers",
			content:
				"Running your API at the edge means sub-50ms response times worldwide. Cloudflare Workers, Deno Deploy, and Vercel Edge Functions bring compute closer to users, but you need to rethink state management and database access patterns.",
			published: true,
		},
		{
			title: "React 19: What You Need to Know",
			slug: "react-19-what-you-need-to-know",
			content:
				"React 19 introduces the React Compiler, server components as a first-class feature, and new hooks like useActionState. The upgrade path is smooth for most apps, but you should audit your use of useEffect and forwardRef.",
			published: true,
		},
		{
			title: "PostgreSQL Tips for Application Developers",
			slug: "postgresql-tips-for-app-developers",
			content:
				"PostgreSQL is more than a relational database. JSON columns, full-text search, CTEs, and window functions let you handle complex queries without extra infrastructure. Learn these features and you will reach for fewer external tools.",
			published: true,
		},
		{
			title: "Writing Effective Tests",
			slug: "writing-effective-tests",
			content:
				"Good tests verify behavior, not implementation. Focus on what the code does from the outside, use realistic inputs, and avoid mocking internals. A small number of well-written integration tests often catches more bugs than hundreds of shallow unit tests.",
			published: true,
		},
		{
			title: "Dark Mode Done Right",
			slug: "dark-mode-done-right",
			content:
				"Dark mode is not just inverting colors. Use semantic design tokens that map to light and dark palettes, respect the user system preference with prefers-color-scheme, and test contrast ratios to ensure readability in both modes.",
			published: true,
		},
		{
			title: "Draft: Notification System Design",
			slug: "draft-notification-system-design",
			content:
				"An early exploration of push notifications across iOS, Android, and web. Covers FCM, APNs, and a unified notification service that fans out to each platform. Still working through delivery guarantees and batching strategies.",
			published: false,
		},
		{
			title: "Draft: Real-Time Features with WebSockets",
			slug: "draft-real-time-features-websockets",
			content:
				"Notes on adding real-time updates to the feed and comments. Comparing WebSockets, Server-Sent Events, and long polling. Need to figure out connection management at the edge before this is ready.",
			published: false,
		},
		{
			title: "Draft: Mobile Performance Optimization",
			slug: "draft-mobile-performance-optimization",
			content:
				"Collecting ideas for improving app startup time and scroll performance on lower-end Android devices. Lazy loading, image compression, and reducing bridge calls are the main levers to explore.",
			published: false,
		},
	];

	const inserted = await db
		.insert(schema.posts)
		.values(posts.map((p) => ({ ...p, authorId: user.id })))
		.onConflictDoNothing({ target: schema.posts.slug })
		.returning({ id: schema.posts.id, title: schema.posts.title });

	console.log(
		`Seeded ${inserted.length} new posts (${posts.length} total in script).`,
	);
}

seed()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error("Seed failed:", err);
		process.exit(1);
	});
