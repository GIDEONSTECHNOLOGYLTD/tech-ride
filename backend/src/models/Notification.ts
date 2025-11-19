import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  
  // Content
  title: string;
  body: string;
  type: 'RIDE' | 'PAYMENT' | 'PROMO' | 'SYSTEM' | 'REFERRAL';
  
  // Localization
  titleTranslations?: {
    en?: string;
    yo?: string;
    ig?: string;
    ha?: string;
    fr?: string;
  };
  bodyTranslations?: {
    en?: string;
    yo?: string;
    ig?: string;
    ha?: string;
    fr?: string;
  };
  
  // Related Data
  relatedRideId?: mongoose.Types.ObjectId;
  relatedPaymentId?: mongoose.Types.ObjectId;
  
  // Status
  isRead: boolean;
  isSent: boolean;
  sentAt?: Date;
  
  // Push Notification
  fcmMessageId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['RIDE', 'PAYMENT', 'PROMO', 'SYSTEM', 'REFERRAL'], 
    required: true 
  },
  
  titleTranslations: {
    en: String,
    yo: String,
    ig: String,
    ha: String,
    fr: String,
  },
  bodyTranslations: {
    en: String,
    yo: String,
    ig: String,
    ha: String,
    fr: String,
  },
  
  relatedRideId: { type: Schema.Types.ObjectId, ref: 'Ride' },
  relatedPaymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
  
  isRead: { type: Boolean, default: false },
  isSent: { type: Boolean, default: false },
  sentAt: Date,
  
  fcmMessageId: String,
}, {
  timestamps: true
});

// Indexes
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ isRead: 1, userId: 1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
