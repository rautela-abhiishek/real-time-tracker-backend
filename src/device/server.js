const express = require('express');
const mongoose = require('mongoose');
const config = require('../config/config');
const logger = require('../common/logger');
const { errorHandler, authenticateToken, validateRequest } = require('../common/middleware');
const Joi = require('joi');

const app = express();

// Connect to MongoDB
mongoose.connect(config.mongodb.uri, config.mongodb.options)
    .then(() => logger.info('Connected to MongoDB'))
    .catch(err => logger.error('MongoDB connection error:', err));

// Device Schema
const deviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    ownerId: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['active', 'inactive', 'maintenance'],
        default: 'active'
    },
    lastSeen: { type: Date },
    metadata: { type: Map, of: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

deviceSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const Device = mongoose.model('Device', deviceSchema);

// Validation schemas
const deviceSchema = Joi.object({
    name: Joi.string().required().min(3).max(50),
    type: Joi.string().required(),
    metadata: Joi.object()
});

// Middleware
app.use(express.json());
app.use(authenticateToken);

// Routes
app.post('/api/devices', validateRequest(deviceSchema), async (req, res) => {
    try {
        const device = new Device({
            ...req.body,
            ownerId: req.user.id
        });
        await device.save();
        res.status(201).json(device);
    } catch (error) {
        logger.error('Error creating device:', error);
        res.status(500).json({ error: 'Failed to create device' });
    }
});

app.get('/api/devices', async (req, res) => {
    try {
        const devices = await Device.find({ ownerId: req.user.id });
        res.json(devices);
    } catch (error) {
        logger.error('Error fetching devices:', error);
        res.status(500).json({ error: 'Failed to fetch devices' });
    }
});

app.get('/api/devices/:id', async (req, res) => {
    try {
        const device = await Device.findOne({
            _id: req.params.id,
            ownerId: req.user.id
        });
        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }
        res.json(device);
    } catch (error) {
        logger.error('Error fetching device:', error);
        res.status(500).json({ error: 'Failed to fetch device' });
    }
});

app.put('/api/devices/:id', validateRequest(deviceSchema), async (req, res) => {
    try {
        const device = await Device.findOneAndUpdate(
            { _id: req.params.id, ownerId: req.user.id },
            { $set: req.body },
            { new: true }
        );
        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }
        res.json(device);
    } catch (error) {
        logger.error('Error updating device:', error);
        res.status(500).json({ error: 'Failed to update device' });
    }
});

app.delete('/api/devices/:id', async (req, res) => {
    try {
        const device = await Device.findOneAndDelete({
            _id: req.params.id,
            ownerId: req.user.id
        });
        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }
        res.json({ message: 'Device deleted successfully' });
    } catch (error) {
        logger.error('Error deleting device:', error);
        res.status(500).json({ error: 'Failed to delete device' });
    }
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = config.services.device;
app.listen(PORT, () => {
    logger.info(`Device Service running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
}); 