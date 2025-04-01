const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const config = require('../config/config');
const logger = require('../common/logger');
const { errorHandler, authenticateToken } = require('../common/middleware');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Connect to MongoDB
mongoose.connect(config.mongodb.uri, config.mongodb.options)
    .then(() => logger.info('Connected to MongoDB'))
    .catch(err => logger.error('MongoDB connection error:', err));

// Location Schema
const locationSchema = new mongoose.Schema({
    deviceId: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

const Location = mongoose.model('Location', locationSchema);

// Middleware
app.use(express.json());
app.use(authenticateToken);

// WebSocket connection handling
io.on('connection', (socket) => {
    logger.info('New client connected');

    socket.on('location-update', async (data) => {
        try {
            const location = new Location({
                deviceId: data.deviceId,
                latitude: data.latitude,
                longitude: data.longitude
            });
            await location.save();

            // Broadcast location update to all connected clients
            io.emit('location-updated', {
                deviceId: data.deviceId,
                location: {
                    latitude: data.latitude,
                    longitude: data.longitude,
                    timestamp: location.timestamp
                }
            });
        } catch (error) {
            logger.error('Error saving location:', error);
            socket.emit('error', { message: 'Failed to save location' });
        }
    });

    socket.on('disconnect', () => {
        logger.info('Client disconnected');
    });
});

// REST API endpoints
app.get('/api/locations/:deviceId', async (req, res) => {
    try {
        const locations = await Location.find({ deviceId: req.params.deviceId })
            .sort({ timestamp: -1 })
            .limit(100);
        res.json(locations);
    } catch (error) {
        logger.error('Error fetching locations:', error);
        res.status(500).json({ error: 'Failed to fetch locations' });
    }
});

app.get('/api/locations/realtime/:deviceId', async (req, res) => {
    try {
        const location = await Location.findOne({ deviceId: req.params.deviceId })
            .sort({ timestamp: -1 });
        res.json(location);
    } catch (error) {
        logger.error('Error fetching real-time location:', error);
        res.status(500).json({ error: 'Failed to fetch real-time location' });
    }
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = config.services.location;
server.listen(PORT, () => {
    logger.info(`Location Service running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
}); 