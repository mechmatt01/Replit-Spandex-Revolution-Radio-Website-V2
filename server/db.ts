import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Database operations will fail.");
  console.error("Please set DATABASE_URL environment variable.");
}

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
export const db = sql ? drizzle(sql) : null;