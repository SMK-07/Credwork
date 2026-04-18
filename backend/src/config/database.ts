import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

// Phase 2 — MongoDB Atlas connection using Singleton DatabaseConnection class
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
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      console.log('✅ MongoDB Atlas connected successfully');
    } catch (error) {
      console.warn('⚠️ MongoDB Atlas failed, spinning up local memory fallback DB...');
      try {
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
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err);
    });
  }

  public async disconnect(): Promise<void> {
    await mongoose.disconnect();
    console.log('MongoDB disconnected gracefully');
  }
}

