import { z } from "zod";

export const projectSchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(["ongoing", "completed"]),
  category: z.string(),
  progress: z.number().int().min(0).max(100),
  location: z.string(),
  value: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable().optional(),
  imageUrl: z.string(),
  images: z.array(z.string()),
  galleryImages: z.array(z.string()),
  features: z.array(z.string()),
  amenities: z.array(z.string()),
  featured: z.boolean(),
  phase: z.string().nullable().optional(),
  createdAt: z.string()
});

export const serviceSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  features: z.array(z.string()),
  order: z.number().int(),
  createdAt: z.string()
});

export const testimonialSchema = z.object({
  id: z.number(),
  clientName: z.string(),
  clientTitle: z.string(),
  message: z.string(),
  rating: z.number().int().min(1).max(5),
  avatarUrl: z.string().nullable().optional(),
  featured: z.boolean(),
  createdAt: z.string()
});

export const callbackSchema = z.object({
  id: z.number(),
  name: z.string(),
  phone: z.string(),
  email: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
  status: z.enum(["pending", "contacted", "resolved"]),
  createdAt: z.string()
});

export const teamMemberSchema = z.object({
  id: z.number(),
  name: z.string(),
  role: z.string(),
  bio: z.string(),
  avatarUrl: z.string().nullable().optional(),
  socialLinks: z.record(z.string()).default({}),
  order: z.number().int(),
  createdAt: z.string()
});

export const dashboardStatsSchema = z.object({
  totalProjects: z.number(),
  ongoingProjects: z.number(),
  completedProjects: z.number(),
  pendingCallbacks: z.number(),
  totalCallbacks: z.number(),
  happyClients: z.number().optional(),
  yearsExperience: z.number().optional(),
  recentCallbacks: z.array(callbackSchema),
  projectsByCategory: z.array(z.object({ category: z.string(), count: z.number() })),
  recentProjects: z.array(projectSchema)
});

export const publicStatsSchema = z.object({
  totalProjects: z.number(),
  ongoingProjects: z.number(),
  completedProjects: z.number(),
  yearsExperience: z.number(),
  happyClients: z.number(),
  teamSize: z.number()
});

export const siteSettingsSchema = z.object({
  overviewBadge: z.string().nullable().optional(),
  overviewTitle: z.string().nullable().optional(),
  overviewDescription: z.string().nullable().optional(),
  totalProjects: z.number().int().optional(),
  yearsExperience: z.number().int().optional(),
  happyClients: z.number().int().optional(),
  teamSize: z.number().int().optional(),
  heroImage: z.string().nullable().optional(),
  logoImage: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional()
}).passthrough();
