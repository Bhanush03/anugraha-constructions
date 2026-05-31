import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(16).optional().default("anugraha-session-secret"),
  PORT: z.string().optional().default("3001"),
  JWT_SECRET: z.string().min(16).optional().default("replace-with-a-long-jwt-secret"),
  UPLOAD_DIR: z.string().optional().default("./public/images"),
  ADMIN_USERNAME: z.string().optional().default("admin"),
  ADMIN_PASSWORD: z.string().min(16).optional().default("changeme123"),
  ALLOW_PASSWORDLESS_ADMIN: z.preprocess((v) => {
    if (v === undefined) return true;
    if (typeof v === "string") return v === "true";
    return Boolean(v);
  }, z.boolean()).optional().default(true),
  WHATSAPP_API_URL: z.string().url().optional(),
  WHATSAPP_API_TOKEN: z.string().optional(),
  WHATSAPP_OWNER_NUMBER: z.string().optional()
});

export const env = envSchema.parse(process.env);
