import type { InferSelectModel } from "drizzle-orm";

import { callbacks, projects, services, team, testimonials } from "./db/index.js";

const toIso = (value: Date | string | null | undefined) => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  if (isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
};
const parseJsonArray = (value: string | string[] | null | undefined) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
const parseJsonObject = (value: string | Record<string, string> | null | undefined) => {
  if (value && typeof value !== "string") return value;
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const serializeProject = (project: InferSelectModel<typeof projects>) => ({
  ...project,
  slug: project.slug || slugify(project.title),
  images: parseJsonArray(project.images),
  galleryImages: parseJsonArray(project.images),
  features: parseJsonArray(project.features),
  amenities: parseJsonArray(project.amenities),
  featured: Boolean(project.featured),
  createdAt: toIso(project.createdAt)
});

export const serializeService = (service: InferSelectModel<typeof services>) => ({
  ...service,
  features: parseJsonArray(service.features),
  createdAt: toIso(service.createdAt)
});

export const serializeTestimonial = (testimonial: InferSelectModel<typeof testimonials>) => ({
  ...testimonial,
  featured: Boolean(testimonial.featured),
  createdAt: toIso(testimonial.createdAt)
});

export const serializeCallback = (callback: InferSelectModel<typeof callbacks>) => ({
  ...callback,
  createdAt: toIso(callback.createdAt)
});

export const serializeTeamMember = (member: InferSelectModel<typeof team>) => ({
  ...member,
  socialLinks: parseJsonObject(member.socialLinks),
  createdAt: toIso(member.createdAt)
});
