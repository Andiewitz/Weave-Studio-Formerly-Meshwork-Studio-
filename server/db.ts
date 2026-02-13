import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set, using in-memory storage");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgres://" });
export const db = drizzle(pool, { schema });
