require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const router = require('./src/router');
require('./src/config/passport');
const { RedisStore } = require('connect-redis');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const { sequelize } = require('./src/models');
const validateEnv = require('./src/utils/validateEnv');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    validateEnv();
    const app = express();

    const { redisClient, connectRedis } = require('./src/config/redis');

    console.log(typeof RedisStore);
    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis client connected successfully');
    });

    redisClient.on('ready', () => {
      console.log('Redis client is ready');
    });
    await connectRedis();
    console.log('Redis connection initialized');

    app.use(
      session({
        store: new RedisStore({
          client: redisClient,
          prefix: 'booking_session:',
          ttl: 86400, //24 hours
        }),
        secret: process.env.SESSION_SECRET || 'a_strong_secret_for_development',
        resave: false,
        saveUninitialized: false,
        rolling: true, // Reset expiration on activity
        cookie: {
          httpOnly: true,
          secure: false,
          maxAge: 1000 * 60 * 60 * 24, // 1 day
          //maxAge: 1000 * 10, // 10 seconds
          sameSite: 'lax',
        },
      })
    );
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(
      cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        credentials: true,
      })
    );

    app.use(cookieParser());
    app.use(morgan('dev'));
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    app.use(express.static('public'));

    app.use('/', router);
    const startServer = async () => {
      try {
        if (redisClient.isReady) {
          const pingResult = await redisClient.ping();
          console.log('Redis connection test successful:', pingResult);
        } else {
          console.warn('Redis client is not ready yet');
        }
        await sequelize.authenticate();
        console.log('Database connected successfully');

        await sequelize.sync({ force: false });
        console.log('Database synchronized');

        app.listen(PORT, () => {
          console.log(`Server running on port ${PORT}`);
          console.log(`Environment: ${process.env.NODE_ENV}`);
        });
      } catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully');
      try {
        await redisClient.quit();
        console.log('Redis client disconnected');
      } catch (err) {
        console.error('Error disconnecting Redis:', err);
      } finally {
        process.exit(0);
      }
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully');
      try {
        await redisClient.quit();
        console.log('Redis client disconnected');
      } catch (err) {
        console.error('Error disconnecting Redis:', err);
      } finally {
        process.exit(0);
      }
    });

    await startServer();
  } catch (error) {
    console.error('Fatal error during application startup:', error);
    process.exit(1);
  }
})();
