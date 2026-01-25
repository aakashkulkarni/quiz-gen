import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { config } from "./env";

const pool = new Pool({
  connectionString: config.database.url,
});

export const db = drizzle(pool, { casing: "camelCase" });
