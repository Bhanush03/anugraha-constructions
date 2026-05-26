import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	slug: text("slug").notNull().default(""),
	title: text("title").notNull(),
	description: text("description").notNull(),
	status: text("status").notNull().default("ongoing"),
	category: text("category").notNull(),
	progress: integer("progress").notNull().default(0),
	location: text("location").notNull(),
	value: text("value").notNull(),
	startDate: text("start_date").notNull(),
	endDate: text("end_date"),
	imageUrl: text("image_url").notNull(),
	images: text("images").notNull(),
	features: text("features").notNull().default("[]"),
	amenities: text("amenities").notNull().default("[]"),
	featured: integer("featured", { mode: "boolean" }).notNull().default(false),
	phase: text("phase"),
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const services = sqliteTable("services", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	title: text("title").notNull(),
	description: text("description").notNull(),
	icon: text("icon").notNull(),
	features: text("features").notNull(),
	order: integer("order").notNull().default(0),
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const testimonials = sqliteTable("testimonials", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	clientName: text("client_name").notNull(),
	clientTitle: text("client_title").notNull(),
	message: text("message").notNull(),
	rating: integer("rating").notNull().default(5),
	avatarUrl: text("avatar_url"),
	featured: integer("featured", { mode: "boolean" }).notNull().default(false),
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const callbacks = sqliteTable("callbacks", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	phone: text("phone").notNull(),
	email: text("email"),
	message: text("message"),
	status: text("status").notNull().default("pending"),
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const team = sqliteTable("team", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	role: text("role").notNull(),
	bio: text("bio").notNull(),
	avatarUrl: text("avatar_url"),
	order: integer("order").notNull().default(0),
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const users = sqliteTable("users", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	username: text("username").notNull(),
	passwordHash: text("password_hash").notNull(),
	role: text("role").notNull().default("admin"),
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const siteSettings = sqliteTable("site_settings", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	overviewBadge: text("overview_badge"),
	overviewTitle: text("overview_title"),
	overviewDescription: text("overview_description"),
	totalProjects: integer("total_projects").notNull().default(0),
	yearsExperience: integer("years_experience").notNull().default(0),
	happyClients: integer("happy_clients").notNull().default(0),
	teamSize: integer("team_size").notNull().default(0),
	heroImage: text("hero_image"),
	logoImage: text("logo_image"),
	updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const schemaRelations = relations;
