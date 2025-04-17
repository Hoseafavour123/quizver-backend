import { Schema, model, Types } from 'mongoose'

export interface IEarning {
  userId: Types.ObjectId
  quizId: Types.ObjectId
  amount: number
  earnedAt: Date
}

const earningSchema = new Schema<IEarning>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    amount: { type: Number, required: true },
    earnedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export const Earning = model<IEarning>('UserEarning', earningSchema)