import { NextFunction, Request, Response } from "express";
import pino from "pino";
import { ZodError } from "zod";

const logger = pino();

export function apiErrorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    logger.warn({ err: err.errors }, "validation_error");
    return res.status(400).json({ error: "validation_error", details: err.errors });
  }

  // Known error shapes
  if (err && typeof err === "object" && err.status && err.message) {
    logger.warn({ err }, "http_error");
    return res.status(err.status).json({ error: err.message });
  }

  logger.error({ err }, "unhandled_error");
  if (process.env.NODE_ENV === "production") {
    return res.status(500).json({ error: "Internal Server Error" });
  }
  return res.status(500).json({ error: err?.message ?? String(err), stack: err?.stack });
}

export default apiErrorHandler;
