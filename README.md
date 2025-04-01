# Real-time Device Tracker with Microservices Architecture

A scalable real-time device tracking system built with Node.js and Express.js using a microservices architecture.

## Project Structure

```
src/
├── gateway/           # API Gateway service
├── location/          # Location tracking service
├── auth/             # Authentication service
├── device/           # Device management service
├── common/           # Shared utilities and middleware
└── config/           # Configuration files
```

## Features

- Real-time device location tracking
- User authentication and authorization
- Device management and registration
- Scalable microservices architecture
- WebSocket support for real-time updates
- MongoDB for data persistence
- Rate limiting and security features
- Logging and monitoring

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis (for caching)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/tracker
   JWT_SECRET=your_jwt_secret
   REDIS_URL=redis://localhost:6379
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

### Authentication Service
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- POST /api/auth/refresh-token - Refresh access token

### Device Service
- POST /api/devices - Register a new device
- GET /api/devices - Get all devices
- GET /api/devices/:id - Get device details
- PUT /api/devices/:id - Update device information

### Location Service
- POST /api/locations - Update device location
- GET /api/locations/:deviceId - Get device location history
- GET /api/locations/realtime/:deviceId - Get real-time device location

## Testing

Run tests:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
