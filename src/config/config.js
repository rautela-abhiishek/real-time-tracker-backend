require('dotenv').config();

module.exports = {
    // Server Configuration
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // MongoDB Configuration
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tracker',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    },

    // JWT Configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: '24h'
    },

    // Redis Configuration
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    },

    // Service Ports
    services: {
        auth: process.env.AUTH_SERVICE_PORT || 3001,
        device: process.env.DEVICE_SERVICE_PORT || 3002,
        location: process.env.LOCATION_SERVICE_PORT || 3003
    },

    // Rate Limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    },

    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: 'combined'
    }
}; 