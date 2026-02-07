import { Pool } from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

let db: NodePgDatabase<typeof schema> | null = null;
let pool: Pool | null = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
} else {
  console.warn(
    "DATABASE_URL not set — running without database. MemStorage will be used.",
  );
}

export { db, pool };
