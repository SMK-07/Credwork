import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Phase 2  MongoDB Atlas connection using Singleton DatabaseConnection class
export class DatabaseConnection {
  private static instance: DatabaseConnection;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
      console.log(' MongoDB Atlas connected successfully');
    } catch (error) {
      const isProduction = process.env.NODE_ENV === 'production';

      if (isProduction) {
        // In production, we must connect to Atlas — no fallback
        console.error('❌ MongoDB Atlas connection failed in production:', error);
        console.error('   Check: MONGODB_URI is set correctly in Render env vars');
        console.error('   Check: 0.0.0.0/0 is whitelisted in MongoDB Atlas Network Access');
        process.exit(1);
      }

      // Local dev only — spin up in-memory MongoDB
      console.warn('⚠️ MongoDB Atlas failed, attempting local memory fallback...');
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const memoryUri = mongoServer.getUri();
        await mongoose.connect(memoryUri);
        console.log('✅ Local MongoDB Memory Server connected successfully');
      } catch (memError) {
        console.error('❌ Both Atlas and Local DB failed:', memError);
        process.exit(1);
      }
    }

    mongoose.connection.on('disconnected', () => {
      console.warn('  MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error(' MongoDB error:', err);
    });
  }

  public async disconnect(): Promise<void> {
    await mongoose.disconnect();
    console.log('MongoDB disconnected gracefully');
  }
}

