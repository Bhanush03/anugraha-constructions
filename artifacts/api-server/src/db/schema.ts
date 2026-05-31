import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
	id: serial("id").primaryKey(),
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
	featured: boolean("featured").notNull().default(false),
	phase: text("phase"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const services = pgTable("services", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	icon: text("icon").notNull(),
	features: text("features").notNull(),
	order: integer("order").notNull().default(0),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const testimonials = pgTable("testimonials", {
	id: serial("id").primaryKey(),
	clientName: text("client_name").notNull(),
	clientTitle: text("client_title").notNull(),
	message: text("message").notNull(),
	rating: integer("rating").notNull().default(5),
	avatarUrl: text("avatar_url"),
	featured: boolean("featured").notNull().default(false),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const callbacks = pgTable("callbacks", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	phone: text("phone").notNull(),
	email: text("email"),
	message: text("message"),
	status: text("status").notNull().default("pending"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const team = pgTable("team", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	role: text("role").notNull(),
	bio: text("bio").notNull(),
	avatarUrl: text("avatar_url"),
	order: integer("order").notNull().default(0),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	username: text("username").notNull(),
	passwordHash: text("password_hash").notNull(),
	role: text("role").notNull().default("admin"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const siteSettings = pgTable("site_settings", {
	id: serial("id").primaryKey(),
	overviewBadge: text("overview_badge"),
	overviewTitle: text("overview_title"),
	overviewDescription: text("overview_description"),
	totalProjects: integer("total_projects").notNull().default(0),
	yearsExperience: integer("years_experience").notNull().default(0),
	happyClients: integer("happy_clients").notNull().default(0),
	teamSize: integer("team_size").notNull().default(0),
	heroImage: text("hero_image"),
	logoImage: text("logo_image"),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});
