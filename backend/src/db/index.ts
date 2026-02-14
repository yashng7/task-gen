import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

console.log("🔗 Connecting to database...");
console.log(`🔗 Host: ${databaseUrl.split("@")[1]?.split("/")[0] || "unknown"}`);

const client = postgres(databaseUrl, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 30,
  prepare: false,
  ssl: "require",
});

export const db = drizzle(client, { schema });
export { client };