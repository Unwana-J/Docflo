import pg from "pg";
import { config } from "./config.js";

const { Pool } = pg;

if (!config.postgresUrl) {
  console.warn(
    "[db] POSTGRES_URL not set. The API will not be able to persist auth/team data."
  );
}

export const pool = new Pool({
  connectionString: config.postgresUrl || undefined,
});

export async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

