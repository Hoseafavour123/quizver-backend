import mongoose, { Schema, Document } from 'mongoose'

export interface INotification extends Document {
  userId?: mongoose.Types.ObjectId
  type: 'payment' | 'welcome' | 'update'
  title: string
  message: string
  readBy: mongoose.Types.ObjectId[] // store users who have read this notification
  createdAt: Date
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: mongoose.Types.ObjectId, ref: 'User', required: false }, // null = general
  type: {
    type: String,
    enum: ['payment', 'welcome', 'update'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  readBy: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
})

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema)