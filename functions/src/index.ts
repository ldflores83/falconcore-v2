import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';

// Ahau router
import { ahauRouter } from './routes/ahau';

// Public endpoints
import { trackVisit } from './api/public/trackVisit';
import { addToWaitlist } from './api/public/addToWaitlist';

// Initialize Firebase Admin
admin.initializeApp();

// Create Express app
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Routes
app.use('/api/ahau', ahauRouter);

// Public routes
app.post('/api/public/trackVisit', trackVisit);
app.post('/api/public/addToWaitlist', addToWaitlist);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Export as Firebase Function
export const api = functions.https.onRequest(app);
