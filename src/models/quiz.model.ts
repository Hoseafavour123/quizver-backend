import mongoose from 'mongoose'

export interface QuizDocument extends mongoose.Document {
  title: string
  description: string
  duration: number
  status: 'draft' | 'live' | 'closed' | 'scheduled'
  startTime: Date
  category: string
  notificationSent: boolean
  scheduledAt : Date
  questions: [
    {
      image: string
      text: string
      options: [string]
      correctAnswer: string
    }
  ]
}

const quizSchema = new mongoose.Schema<QuizDocument>(
  {
    title: String,
    description: String,
    duration: Number,
    status: {
      type: String,
      enum: ['draft', 'live', 'closed', 'scheduled'],
      default: 'draft',
    },
    startTime: { type: Date, default: null },
    category: String,
    notificationSent: { type: Boolean, default: false },
    scheduledAt: {
      type: Date,
      default: null,
    },
    questions: [
      {
        image: String,
        text: String,
        options: [String],
        correctAnswer: String,
      },
    ],
  },
  {
    timestamps: true,
  }
)

const QuizModel = mongoose.model<QuizDocument>('Quiz', quizSchema)
export default QuizModel
