import { createClient } from "redis";
import { config } from "./config.js";

let client;

export async function getRedis() {
  if (client) return client;

  if (!config.redisUrl) {
    console.warn(
      "[redis] REDIS_URL not set. Magic link tokens will not persist between server restarts."
    );
    client = createClient();
  } else {
    client = createClient({ url: config.redisUrl });
  }

  client.on("error", (err) => {
    console.error("[redis] Client error", err);
  });

  if (!client.isOpen) {
    await client.connect();
  }

  return client;
}

