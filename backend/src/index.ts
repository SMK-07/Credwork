import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

import { DatabaseConnection } from './config/database';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/authRoutes';
import workerRoutes from './routes/workerRoutes';
import jobRoutes from './routes/jobRoutes';
import applicationRoutes from './routes/applicationRoutes';
import disputeRoutes from './routes/disputeRoutes';
import adminRoutes from './routes/adminRoutes';

// Services  instantiated once at startup to register EventBus observers
import { MongoScoreRepository } from './repositories/mongo/MongoScoreRepository';
import { MongoWorkerRepository } from './repositories/mongo/MongoWorkerRepository';
import { TrustScoreService } from './services/TrustScoreService';
import { NotificationService } from './services/NotificationService';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 5000;

// Middleware
const allowedOrigin = process.env.FRONTEND_URL?.replace(/\/$/, '') ?? 'http://localhost:5173';

app.use(cors({
  origin: (origin, callback) => {
    // Allow if: 1. No origin (like mobile apps/curl), 2. Matches allowedOrigin, 3. Is a Vercel preview/deploy
    if (!origin || origin === allowedOrigin || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

//  Routes 
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

//  Global Error Handler  must be last 
app.use(errorHandler);

//  Bootstrap 
async function bootstrap(): Promise<void> {
  // Connect to MongoDB Atlas
  await DatabaseConnection.getInstance().connect();

  // Instantiate services that register EventBus observers
  // These must be created AFTER DB connection so they can write to MongoDB
  const scoreRepo = new MongoScoreRepository();
  const workerRepo = new MongoWorkerRepository();

  // TrustScoreService registers 'outcome.confirmed' and 'dispute.resolved' listeners
  new TrustScoreService(scoreRepo, workerRepo);

  // NotificationService registers 'outcome.confirmed' and 'dispute.resolved' listeners
  new NotificationService();

  app.listen(PORT, () => {
    console.log(`🚀 Credwork backend running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV}`);
    console.log(`   CORS Allowed Origin: ${allowedOrigin}`);
    console.log(`   MongoDB: connected`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
