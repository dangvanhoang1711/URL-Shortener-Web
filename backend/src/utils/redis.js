const { createClient } = require("redis");

let redisClientPromise;

async function getRedisClient() {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!redisClientPromise) {
    const client = createClient({ url: process.env.REDIS_URL });

    client.on("error", (error) => {
      console.error("Redis error:", error.message);
    });

    redisClientPromise = client.connect().then(() => client);
  }

  return redisClientPromise;
}

module.exports = { getRedisClient };
