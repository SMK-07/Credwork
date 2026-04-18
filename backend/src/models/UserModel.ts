import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types/enums';

// Phase 3  Abstract base User schema
// Worker and Employer documents reference this via userId field

export interface IUserDocument extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  validatePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false, versionKey: false },
);

// Instance method  validates plain password against stored hash
UserSchema.methods.validatePassword = async function (
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

// Remove passwordHash from JSON serialisation
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema, 'users');
