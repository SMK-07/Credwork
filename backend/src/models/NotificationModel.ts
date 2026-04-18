import mongoose, { Document, Schema } from 'mongoose';

export interface INotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'INFO',
    },
    read: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false, versionKey: false },
);

export const NotificationModel = mongoose.model<INotificationDocument>(
  'Notification',
  NotificationSchema,
  'notifications',
);
