import mongoose, { Schema, Document } from 'mongoose'


export interface ICompletedQuiz extends Document {
  userId: mongoose.Types.ObjectId
  quizId: mongoose.Types.ObjectId
  answers: Map<number, string> // Example: { "0": "B", "1": "A" }
  score: number
  totalQuestions: number
  completedAt?: Date
}

const completedQuizSchema = new Schema<ICompletedQuiz>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  quizId: { type: Schema.Types.ObjectId, required: true, ref:'Quiz' },
  answers: { type: Map, of: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now },
})

const CompletedQuiz = mongoose.model<ICompletedQuiz>(
  'CompletedQuiz',
  completedQuizSchema
)

export default CompletedQuiz