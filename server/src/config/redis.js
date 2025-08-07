const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

let isConnected = false;

const connectRedis = async () => {
  if (!isConnected) {
    await redisClient.connect();
    isConnected = true;
    console.log('Redis client connected');
  }
};

module.exports = { redisClient, connectRedis };
