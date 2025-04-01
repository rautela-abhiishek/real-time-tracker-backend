const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config/config');
const logger = require('../common/logger');
const { errorHandler, rateLimiter } = require('../common/middleware');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan(config.logging.format));
app.use(express.json());
app.use(rateLimiter);

// Proxy middleware configuration
const authServiceProxy = createProxyMiddleware({
    target: `http://localhost:${config.services.auth}`,
    changeOrigin: true,
    pathRewrite: {
        '^/api/auth': '/api'
    },
    onError: (err, req, res) => {
        logger.error('Auth Service Proxy Error:', err);
        res.status(500).json({ error: 'Auth Service Error' });
    }
});

const deviceServiceProxy = createProxyMiddleware({
    target: `http://localhost:${config.services.device}`,
    changeOrigin: true,
    pathRewrite: {
        '^/api/devices': '/api'
    },
    onError: (err, req, res) => {
        logger.error('Device Service Proxy Error:', err);
        res.status(500).json({ error: 'Device Service Error' });
    }
});

const locationServiceProxy = createProxyMiddleware({
    target: `http://localhost:${config.services.location}`,
    changeOrigin: true,
    pathRewrite: {
        '^/api/locations': '/api'
    },
    onError: (err, req, res) => {
        logger.error('Location Service Proxy Error:', err);
        res.status(500).json({ error: 'Location Service Error' });
    }
});

// Routes
app.use('/api/auth', authServiceProxy);
app.use('/api/devices', deviceServiceProxy);
app.use('/api/locations', locationServiceProxy);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// Error handling
app.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
    logger.info(`API Gateway running on port ${config.port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
}); 