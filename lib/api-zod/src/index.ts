import { z } from "zod";

export const isoDateString = z.string();

export const projectSchema = z.object({
  id: z.number(),
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
  order: z.number().int(),
  createdAt: z.string()
});

export const dashboardStatsSchema = z.object({
  totalProjects: z.number(),
  ongoingProjects: z.number(),
  completedProjects: z.number(),
  pendingCallbacks: z.number(),
  totalCallbacks: z.number(),
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

export type Project = z.infer<typeof projectSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type Testimonial = z.infer<typeof testimonialSchema>;
export type Callback = z.infer<typeof callbackSchema>;
export type TeamMember = z.infer<typeof teamMemberSchema>;
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
export type PublicStats = z.infer<typeof publicStatsSchema>;
