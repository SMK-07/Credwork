import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { UserModel } from '../models/UserModel';
import { UserRole } from '../types/enums';
import { AppError } from '../utils/StateMachine';

// Phase 7  AuthService handles registration and login via email
export class AuthService {
  private readonly jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET ?? 'fallback_secret';
  }

  public async register(
    email: string,
    password: string,
    role: UserRole,
  ): Promise<{ userId: string; role: UserRole }> {
    const existing = await UserModel.findOne({ email }).exec();
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = new UserModel({ email, passwordHash, role });
    await user.save();

    return { userId: (user._id as mongoose.Types.ObjectId).toString(), role };
  }

  public async login(
    email: string,
    password: string,
  ): Promise<{ token: string; userId: string; role: UserRole }> {
    const user = await UserModel.findOne({ email }).exec();
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const userId = (user._id as mongoose.Types.ObjectId).toString();
    const token = this.generateJWT(userId, user.role);

    return { token, userId, role: user.role };
  }

  public generateJWT(userId: string, role: UserRole): string {
    return jwt.sign({ userId, role }, this.jwtSecret, { expiresIn: '7d' });
  }

  public verifyJWT(token: string): { userId: string; role: UserRole } {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { userId: string; role: UserRole };
      return decoded;
    } catch {
      throw new AppError('Invalid or expired token', 401);
    }
  }
}
