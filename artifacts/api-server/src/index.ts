// dotenv is optional in this environment — rely on `env.ts` parsing process.env
import cors from "cors";
import express from "express";
import pino from "pino";
import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { callbacks, projects, services, team, testimonials, siteSettings } from "@anugraha/db";

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { env } from "./env.js";
import { requireAuth, requireAdmin } from "./middleware/auth.js";

// DB-backed API: requires DATABASE_URL at startup
const { db, persistDatabase } = await import("./db.js");
const { seedDatabase } = await import("./seed.js");
import { serializeCallback, serializeProject, serializeService, serializeTeamMember, serializeTestimonial } from "./serializers.js";

const app = express();
app.use(cors());
// Increase JSON body size to allow data URL image uploads from admin UI
app.use(express.json({ limit: "10mb" }));
const logger = pino();
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    logger.info({ method: req.method, url: req.originalUrl, statusCode: res.statusCode, durationMs: Date.now() - startedAt }, "request");
  });
  next();
});

const idSchema = z.object({ id: z.coerce.number().int().positive() });
const projectInputSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(["ongoing", "completed"]),
  category: z.string().min(1),
  progress: z.number().int().min(0).max(100),
  location: z.string().min(1),
  value: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().nullable().optional(),
  imageUrl: z.string().min(1),
  images: z.array(z.string().min(1)).optional().default([]),
  galleryImages: z.array(z.string().min(1)).optional(),
  features: z.array(z.string().min(1)).optional().default([]),
  amenities: z.array(z.string().min(1)).optional().default([]),
  featured: z.boolean().optional().default(false),
  phase: z.string().nullable().optional()
});
const serviceInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
  features: z.array(z.string()).default([]),
  order: z.number().int().default(0)
});
const testimonialInputSchema = z.object({
  clientName: z.string().min(1),
  clientTitle: z.string().min(1),
  message: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  avatarUrl: z.string().url().nullable().optional(),
  featured: z.boolean().optional().default(false)
});
const callbackInputSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().optional().or(z.literal(""))
});
const teamInputSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  bio: z.string().min(1),
  avatarUrl: z.string().url().nullable().optional(),
  order: z.number().int().default(0)
});

function notFound(message: string) {
  return { error: message };
}

function mapProject(project: typeof projects.$inferSelect) {
  return serializeProject(project);
}

function mapService(service: typeof services.$inferSelect) {
  return serializeService(service);
}

function mapTestimonial(testimonial: typeof testimonials.$inferSelect) {
  return serializeTestimonial(testimonial);
}

function mapCallback(callback: typeof callbacks.$inferSelect) {
  return serializeCallback(callback);
}

function mapTeamMember(member: typeof team.$inferSelect) {
  return serializeTeamMember(member);
}

app.get("/api/healthz", (_req, res) => {
  res.json({ ok: true });
});

// Auth
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'missing_credentials' });
  try {
    const dbModule = await import('@anugraha/db');
    const [user] = await db.select().from(dbModule.users).where(eq(dbModule.users.username, username));
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });
    const stored = (user as any).passwordHash || (user as any).password_hash || '';
    let ok = false;
    if (stored.includes(':')) {
      const [hash, salt] = stored.split(':');
      const derived = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
      ok = derived === hash;
    } else {
      ok = password === stored;
    }
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
    const { signToken } = await import('./middleware/auth.js');
    const token = signToken({ username: user.username, role: user.role });
    res.json({ token });
  } catch (e) {
    res.status(500).json({ error: 'server_error' });
  }
});

// Settings persistence (simple JSON file + image save from data URLs)
const SETTINGS_FILE = path.join(process.cwd(), "site-settings.json");
const FRONTEND_IMAGES_DIR = path.join(process.cwd(), "..", "anugraha", "public", "images");

function writeSettings(data: any) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function readSettings() {
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveDataUrlImage(dataUrl: string, filename: string) {
  if (!dataUrl || !dataUrl.startsWith("data:")) return null;
  const matches = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches) return null;
  const [, mime, b64] = matches;
  const ext = mime.split("/")[1];
  const targetName = filename.endsWith(`.${ext}`) ? filename : `${filename}.${ext}`;
  const outPath = path.join(FRONTEND_IMAGES_DIR, targetName);
  const buffer = Buffer.from(b64, "base64");
  fs.mkdirSync(FRONTEND_IMAGES_DIR, { recursive: true });
  fs.writeFileSync(outPath, buffer);
  return `/images/${targetName}`;
}

function normalizeProjectImage(imageValue: string | undefined | null, filename: string) {
  if (!imageValue) return imageValue;
  if (imageValue.startsWith("data:")) {
    const saved = saveDataUrlImage(imageValue, filename);
    return saved ?? imageValue;
  }
  return imageValue;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const siteSettingsInputSchema = z.object({
  overviewBadge: z.string().optional().nullable(),
  overviewTitle: z.string().optional().nullable(),
  overviewDescription: z.string().optional().nullable(),
  totalProjects: z.number().int().optional(),
  yearsExperience: z.number().int().optional(),
  happyClients: z.number().int().optional(),
  teamSize: z.number().int().optional(),
  heroImage: z.string().optional().nullable(),
  logoImage: z.string().optional().nullable()
});

app.get("/api/settings", async (_req, res) => {
  // Try DB first, then fallback to JSON file for older installs
  try {
    if (db) {
      const [row] = await db.select().from(siteSettings as any).orderBy(desc((siteSettings as any).id)).limit(1);
      if (row) {
        return res.json({
          overviewBadge: (row as any).overviewBadge,
          overviewTitle: (row as any).overviewTitle,
          overviewDescription: (row as any).overviewDescription,
          totalProjects: Number((row as any).totalProjects ?? 0),
          yearsExperience: Number((row as any).yearsExperience ?? 0),
          happyClients: Number((row as any).happyClients ?? 0),
          teamSize: Number((row as any).teamSize ?? 0),
          heroImage: (row as any).heroImage,
          logoImage: (row as any).logoImage,
          updatedAt: (row as any).updatedAt
        });
      }
    }
  } catch (e) {
    // fall through to file-based settings
  }
  res.json(readSettings());
});

app.put("/api/settings", requireAuth, requireAdmin, async (req, res) => {
  try {
    const payload = siteSettingsInputSchema.parse(req.body || {});
    // handle data-url images
    if (typeof payload.heroImage === "string" && payload.heroImage.startsWith("data:")) {
      const saved = saveDataUrlImage(payload.heroImage, "hero-bg");
      if (saved) (payload as any).heroImage = saved;
    }
    if (typeof payload.logoImage === "string" && payload.logoImage.startsWith("data:")) {
      const saved = saveDataUrlImage(payload.logoImage, "logo-small");
      if (saved) (payload as any).logoImage = saved;
    }

    if (!db) {
      // fallback to file-based settings
      const next = { ...readSettings(), ...payload };
      writeSettings(next);
      return res.json(next);
    }

    // upsert: update latest row if exists, otherwise insert
    const [existing] = await db.select().from(siteSettings as any).orderBy(desc((siteSettings as any).id)).limit(1);
    if (existing) {
      await db.update(siteSettings as any).set({
        overviewBadge: (payload as any).overviewBadge ?? existing.overviewBadge,
        overviewTitle: (payload as any).overviewTitle ?? existing.overviewTitle,
        overviewDescription: (payload as any).overviewDescription ?? existing.overviewDescription,
        totalProjects: (payload as any).totalProjects ?? existing.totalProjects,
        yearsExperience: (payload as any).yearsExperience ?? existing.yearsExperience,
        happyClients: (payload as any).happyClients ?? existing.happyClients,
        teamSize: (payload as any).teamSize ?? existing.teamSize,
        heroImage: (payload as any).heroImage ?? existing.heroImage,
        logoImage: (payload as any).logoImage ?? existing.logoImage,
        updatedAt: sql`CURRENT_TIMESTAMP`
      }).where(eq((siteSettings as any).id, (existing as any).id));
    } else {
      await db.insert(siteSettings as any).values({
        overviewBadge: (payload as any).overviewBadge ?? null,
        overviewTitle: (payload as any).overviewTitle ?? null,
        overviewDescription: (payload as any).overviewDescription ?? null,
        totalProjects: (payload as any).totalProjects ?? 0,
        yearsExperience: (payload as any).yearsExperience ?? 0,
        happyClients: (payload as any).happyClients ?? 0,
        teamSize: (payload as any).teamSize ?? 0,
        heroImage: (payload as any).heroImage ?? null,
        logoImage: (payload as any).logoImage ?? null
      });
    }

    const [row] = await db.select().from(siteSettings as any).orderBy(desc((siteSettings as any).id)).limit(1);
    persistDatabase();
    return res.json({
      overviewBadge: (row as any).overviewBadge,
      overviewTitle: (row as any).overviewTitle,
      overviewDescription: (row as any).overviewDescription,
      totalProjects: Number((row as any).totalProjects ?? 0),
      yearsExperience: Number((row as any).yearsExperience ?? 0),
      happyClients: Number((row as any).happyClients ?? 0),
      teamSize: Number((row as any).teamSize ?? 0),
      heroImage: (row as any).heroImage,
      logoImage: (row as any).logoImage,
      updatedAt: (row as any).updatedAt
    });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "validation", issues: err.errors });
    throw err;
  }
});

app.get("/api/stats", async (_req, res) => {
  if (!db) {
    return res.json({ totalProjects: 0, ongoingProjects: 0, completedProjects: 0, yearsExperience: 0, happyClients: 0, teamSize: 0 });
  }
  const [projectCount] = await db.select({ count: count() }).from(projects);
  const [ongoingCount] = await db.select({ count: count() }).from(projects).where(eq(projects.status, "ongoing"));
  const [completedCount] = await db.select({ count: count() }).from(projects).where(eq(projects.status, "completed"));
  const [testimonialCount] = await db.select({ count: count() }).from(testimonials);
  const [teamCount] = await db.select({ count: count() }).from(team);

  res.json({
    totalProjects: Number(projectCount.count),
    ongoingProjects: Number(ongoingCount.count),
    completedProjects: Number(completedCount.count),
    yearsExperience: 15,
    happyClients: Number(testimonialCount.count),
    teamSize: Number(teamCount.count)
  });
});

app.get("/api/stats/dashboard", async (_req, res) => {
  if (!db) {
    return res.json({ totalProjects: 0, ongoingProjects: 0, completedProjects: 0, pendingCallbacks: 0, totalCallbacks: 0, recentCallbacks: [], projectsByCategory: [], recentProjects: [] });
  }
  const [projectCount] = await db.select({ count: count() }).from(projects);
  const [ongoingCount] = await db.select({ count: count() }).from(projects).where(eq(projects.status, "ongoing"));
  const [completedCount] = await db.select({ count: count() }).from(projects).where(eq(projects.status, "completed"));
  const [pendingCount] = await db.select({ count: count() }).from(callbacks).where(eq(callbacks.status, "pending"));
  const [totalCallbacks] = await db.select({ count: count() }).from(callbacks);

  const recentCallbacks = await db.select().from(callbacks).orderBy(desc(callbacks.createdAt)).limit(5);
  const recentProjects = await db.select().from(projects).orderBy(desc(projects.createdAt)).limit(5);
  const categoryCounts = await db
    .select({ category: projects.category, count: count() })
    .from(projects)
    .groupBy(projects.category)
    .orderBy(desc(count()));

  res.json({
    totalProjects: Number(projectCount.count),
    ongoingProjects: Number(ongoingCount.count),
    completedProjects: Number(completedCount.count),
    pendingCallbacks: Number(pendingCount.count),
    totalCallbacks: Number(totalCallbacks.count),
    recentCallbacks: recentCallbacks.map(mapCallback),
    projectsByCategory: categoryCounts.map((item: { category: string; count: bigint | number }) => ({ category: item.category, count: Number(item.count) })),
    recentProjects: recentProjects.map(mapProject)
  });
});

app.get("/api/projects", async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : "all";
  const list = await db.select().from(projects).where(status === "all" ? undefined : eq(projects.status, status as "ongoing" | "completed"));
  res.json(list.map(mapProject));
});

app.get("/api/projects/featured", async (_req, res) => {
  const list = await db.select().from(projects).where(eq(projects.featured, true)).orderBy(desc(projects.createdAt));
  res.json(list.map(mapProject));
});

app.get("/api/projects/ongoing", async (_req, res) => {
  const list = await db.select().from(projects).where(eq(projects.status, "ongoing")).orderBy(desc(projects.createdAt));
  res.json(list.map(mapProject));
});

app.get("/api/projects/:id", async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const [project] = await db.select().from(projects).where(eq(projects.id, id));
  if (!project) return res.status(404).json(notFound("Project not found"));
  res.json(mapProject(project));
});

app.post("/api/projects", requireAuth, requireAdmin, async (req, res) => {
  try {
    const payload = projectInputSchema.parse(req.body);
    const galleryImages = payload.galleryImages ?? payload.images ?? [];
    const nextPayload = {
      ...payload,
      slug: payload.slug ?? slugify(payload.title),
      imageUrl: normalizeProjectImage(payload.imageUrl, `project-${Date.now()}-cover`) ?? payload.imageUrl,
      images: JSON.stringify(galleryImages.map((image, index) => normalizeProjectImage(image, `project-${Date.now()}-${index + 1}`) ?? image)),
      features: JSON.stringify(payload.features ?? []),
      amenities: JSON.stringify(payload.amenities ?? []),
      featured: payload.featured ? 1 : 0
    };
    await db.insert(projects).values(nextPayload);
    const [inserted] = await db.select().from(projects).orderBy(desc(projects.id)).limit(1);
    persistDatabase();
    res.status(201).json(mapProject(inserted));
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "validation", issues: err.errors });
    throw err;
  }
});

app.patch("/api/projects/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = idSchema.parse(req.params);
  try {
    const payload = projectInputSchema.partial().parse(req.body);
    const galleryImages = payload.galleryImages ?? payload.images;
    const nextPayload = {
      ...payload,
      ...(typeof payload.slug === "string" ? { slug: payload.slug } : {}),
      ...(typeof payload.imageUrl === "string" ? { imageUrl: normalizeProjectImage(payload.imageUrl, `project-${id}-cover`) ?? payload.imageUrl } : {}),
      ...(Array.isArray(galleryImages) ? { images: JSON.stringify(galleryImages.map((image, index) => normalizeProjectImage(image, `project-${id}-${index + 1}`) ?? image)) } : {}),
      ...(Array.isArray(payload.features) ? { features: JSON.stringify(payload.features) } : {}),
      ...(Array.isArray(payload.amenities) ? { amenities: JSON.stringify(payload.amenities) } : {}),
      ...(typeof payload.featured === "boolean" ? { featured: payload.featured ? 1 : 0 } : {})
    };
    await db.update(projects).set(nextPayload).where(eq(projects.id, id));
    const [updated] = await db.select().from(projects).where(eq(projects.id, id));
    if (!updated) return res.status(404).json(notFound("Project not found"));
    persistDatabase();
    res.json(mapProject(updated));
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "validation", issues: err.errors });
    throw err;
  }
});

app.delete("/api/projects/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = idSchema.parse(req.params);
  await db.delete(projects).where(eq(projects.id, id));
  persistDatabase();
  res.status(204).end();
});

app.get("/api/services", async (_req, res) => {
  const list = await db.select().from(services).orderBy(asc(services.order));
  res.json(list.map(mapService));
});

app.post("/api/services", requireAuth, requireAdmin, async (req, res) => {
  console.log("POST /api/services body size:", req.headers["content-length"], "content-type:", req.headers["content-type"]);
  console.log("POST /api/services body preview:", String(req.body).slice(0, 400));
  const payload = serviceInputSchema.parse(req.body);
  // handle data-url icon uploads
  if (typeof payload.icon === "string" && payload.icon.startsWith("data:")) {
    const saved = saveDataUrlImage(payload.icon, `service-${Date.now()}`);
    if (saved) payload.icon = saved;
  }
  await db.insert(services).values({ ...payload, features: JSON.stringify(payload.features) });
  const [inserted] = await db.select().from(services).orderBy(desc(services.id)).limit(1);
  persistDatabase();
  console.log("Service inserted", { id: inserted?.id, title: (inserted as any)?.title });
  res.status(201).json(mapService(inserted));
});

app.patch("/api/services/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const payload = serviceInputSchema.partial().parse(req.body);
  if (typeof payload.icon === "string" && payload.icon.startsWith("data:")) {
    const saved = saveDataUrlImage(payload.icon, `service-${id}`);
    if (saved) payload.icon = saved;
  }
  await db.update(services).set({ ...payload, ...(Array.isArray(payload.features) ? { features: JSON.stringify(payload.features) } : {}) }).where(eq(services.id, id));
  const [updated] = await db.select().from(services).where(eq(services.id, id));
  if (!updated) return res.status(404).json(notFound("Service not found"));
  persistDatabase();
  res.json(mapService(updated));
});

app.delete("/api/services/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = idSchema.parse(req.params);
  await db.delete(services).where(eq(services.id, id));
  persistDatabase();
  res.status(204).end();
});

app.get("/api/testimonials", async (_req, res) => {
  const list = await db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
  res.json(list.map(mapTestimonial));
});

app.post("/api/testimonials", requireAuth, requireAdmin, async (req, res) => {
  const payload = testimonialInputSchema.parse(req.body);
  if (typeof payload.avatarUrl === "string" && payload.avatarUrl.startsWith("data:")) {
    const saved = saveDataUrlImage(payload.avatarUrl, `testimonial-${Date.now()}`);
    if (saved) payload.avatarUrl = saved;
  }
  await db.insert(testimonials).values({ ...payload, featured: payload.featured ? 1 : 0 });
  const [inserted] = await db.select().from(testimonials).orderBy(desc(testimonials.id)).limit(1);
  persistDatabase();
  res.status(201).json(mapTestimonial(inserted));
});

app.patch("/api/testimonials/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const payload = testimonialInputSchema.partial().parse(req.body);
  await db.update(testimonials).set({ ...payload, ...(typeof payload.featured === "boolean" ? { featured: payload.featured ? 1 : 0 } : {}) }).where(eq(testimonials.id, id));
  const [updated] = await db.select().from(testimonials).where(eq(testimonials.id, id));
  if (!updated) return res.status(404).json(notFound("Testimonial not found"));
  persistDatabase();
  res.json(mapTestimonial(updated));
});

app.delete("/api/testimonials/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = idSchema.parse(req.params);
  await db.delete(testimonials).where(eq(testimonials.id, id));
  persistDatabase();
  res.status(204).end();
});

app.get("/api/callbacks", async (_req, res) => {
  const list = await db.select().from(callbacks).orderBy(desc(callbacks.createdAt));
  res.json(list.map(mapCallback));
});

app.post("/api/callbacks", requireAuth, requireAdmin, async (req, res) => {
  const payload = callbackInputSchema.parse(req.body);
  await db.insert(callbacks).values({
    name: payload.name,
    phone: payload.phone,
    email: payload.email || null,
    message: payload.message || null
  });
  const [inserted] = await db.select().from(callbacks).orderBy(desc(callbacks.id)).limit(1);
  persistDatabase();
  // notify owner via WhatsApp if configured
  try {
    const settings = readSettings();
    // allow site-settings.json to enable/disable notifications and override API details
    const enabledInSettings = settings.whatsappEnabled !== undefined ? Boolean(settings.whatsappEnabled) : true;
    const owner = (settings.whatsappOwnerNumber as string) || env.WHATSAPP_OWNER_NUMBER;
    const apiUrl = (settings.whatsappApiUrl as string) || env.WHATSAPP_API_URL;
    const token = (settings.whatsappApiToken as string) || env.WHATSAPP_API_TOKEN;
    if (enabledInSettings && owner && apiUrl) {
      const text = `New callback request:\nName: ${payload.name}\nPhone: ${payload.phone}\nEmail: ${payload.email || "N/A"}\nMessage: ${payload.message || "N/A"}`;
      try {
        // attempt to POST to configured WhatsApp API webhook
        await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ to: owner, message: text })
        });
        logger.info({ to: owner }, "whatsapp_notification_sent");
      } catch (waErr) {
        // fallback: log wa.me link for manual click
        const clean = owner.replace(/[^0-9+]/g, "");
        const waLink = `https://wa.me/${clean.replace(/^\+/,"")}?text=${encodeURIComponent(text)}`;
        logger.error({ err: String(waErr), waLink }, "whatsapp_notification_failed");
      }
    } else {
      logger.info({ enabledInSettings, owner, apiUrl }, "whatsapp_notification_skipped");
    }
  } catch (notifyErr) {
    logger.error({ err: String(notifyErr) }, "whatsapp_notify_error");
  }
  res.status(201).json(mapCallback(inserted));
});

// Public callback endpoint: accepts unauthenticated submissions from the public
// and triggers the same WhatsApp notification flow as the admin route.
app.post("/api/public/callbacks", async (req, res) => {
  try {
    const payload = callbackInputSchema.parse(req.body);
    await db.insert(callbacks).values({
      name: payload.name,
      phone: payload.phone,
      email: payload.email || null,
      message: payload.message || null
    });
    const [inserted] = await db.select().from(callbacks).orderBy(desc(callbacks.id)).limit(1);
    persistDatabase();

    // notify owner via WhatsApp if configured
    try {
      const settings = readSettings();
      const enabledInSettings = settings.whatsappEnabled !== undefined ? Boolean(settings.whatsappEnabled) : true;
      const owner = (settings.whatsappOwnerNumber as string) || env.WHATSAPP_OWNER_NUMBER;
      const apiUrl = (settings.whatsappApiUrl as string) || env.WHATSAPP_API_URL;
      const token = (settings.whatsappApiToken as string) || env.WHATSAPP_API_TOKEN;
      if (enabledInSettings && owner && apiUrl) {
        const text = `New callback request:\nName: ${payload.name}\nPhone: ${payload.phone}\nEmail: ${payload.email || "N/A"}\nMessage: ${payload.message || "N/A"}`;
        try {
          await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ to: owner, message: text })
          });
          logger.info({ to: owner }, "whatsapp_notification_sent_public");
        } catch (waErr) {
          const clean = owner.replace(/[^0-9+]/g, "");
          const waLink = `https://wa.me/${clean.replace(/^\+/,"")}?text=${encodeURIComponent(text)}`;
          logger.error({ err: String(waErr), waLink }, "whatsapp_notification_failed_public");
        }
      } else {
        logger.info({ enabledInSettings, owner, apiUrl }, "whatsapp_notification_skipped_public");
      }
    } catch (notifyErr) {
      logger.error({ err: String(notifyErr) }, "whatsapp_notify_error_public");
    }

    res.status(201).json(mapCallback(inserted));
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "validation", issues: err.errors });
    throw err;
  }
});

app.patch("/api/callbacks/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const statusSchema = z.object({ status: z.enum(["pending", "contacted", "resolved"]) });
  const payload = statusSchema.parse(req.body);
  await db.update(callbacks).set(payload).where(eq(callbacks.id, id));
  const [updated] = await db.select().from(callbacks).where(eq(callbacks.id, id));
  if (!updated) return res.status(404).json(notFound("Callback not found"));
  persistDatabase();
  res.json(mapCallback(updated));
});

app.delete("/api/callbacks/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = idSchema.parse(req.params);
  await db.delete(callbacks).where(eq(callbacks.id, id));
  persistDatabase();
  res.status(204).end();
});

app.get("/api/team", async (_req, res) => {
  const list = await db.select().from(team).orderBy(asc(team.order));
  res.json(list.map(mapTeamMember));
});

app.post("/api/team", requireAuth, requireAdmin, async (req, res) => {
  const payload = teamInputSchema.parse(req.body);
  if (typeof payload.avatarUrl === "string" && payload.avatarUrl.startsWith("data:")) {
    const saved = saveDataUrlImage(payload.avatarUrl, `team-${Date.now()}`);
    if (saved) payload.avatarUrl = saved;
  }
  await db.insert(team).values(payload);
  const [inserted] = await db.select().from(team).orderBy(desc(team.id)).limit(1);
  persistDatabase();
  res.status(201).json(mapTeamMember(inserted));
});

app.patch("/api/team/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const payload = teamInputSchema.partial().parse(req.body);
  await db.update(team).set(payload).where(eq(team.id, id));
  const [updated] = await db.select().from(team).where(eq(team.id, id));
  if (!updated) return res.status(404).json(notFound("Team member not found"));
  persistDatabase();
  res.json(mapTeamMember(updated));
});

app.delete("/api/team/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = idSchema.parse(req.params);
  await db.delete(team).where(eq(team.id, id));
  persistDatabase();
  res.status(204).end();
});

async function main() {
  if (typeof seedDatabase === "function") {
    await seedDatabase();
  } else {
    logger.info("DB not configured; skipping database seed.");
  }
  persistDatabase();
  const port = Number(process.env.PORT ?? 3001);
  app.listen(port, () => {
    logger.info({ port }, `API server listening`);
  });
}

import apiErrorHandler from "./middleware/errorHandler.js";

// place error handler after all routes
app.use(apiErrorHandler as any);

main().catch((error) => {
  logger.error({ error }, "startup_failure");
  process.exit(1);
});
