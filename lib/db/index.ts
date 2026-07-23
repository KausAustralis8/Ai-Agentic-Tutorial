import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let cached: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function isDbConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

export function getDb() {
  if (!isDbConfigured()) {
    throw new Error("Database is not configured");
  }
  if (!cached) {
    const sql = neon(process.env.DATABASE_URL!);
    cached = drizzle(sql, { schema });
  }
  return cached;
}
