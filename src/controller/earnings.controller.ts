import { Earning } from '../models/earnings.model'
import catchErrors from '../utils/catchErrors'

export const getUserEarnings = catchErrors(async (req, res) => {
  const userId = req.userId

  const earnings = await Earning.find({ userId })
    .populate('quizId', 'title')
    .sort({ earnedAt: -1 })

  if (!earnings) {
    return res.json({
      totalEarned: 0,
      totalQuizzes: 0,
      earnings: []
    })
  }

  const totalEarned = earnings.reduce((sum, e) => sum + e.amount, 0)

  return res.json({
    totalEarned,
    totalQuizzes: earnings.length,
    earnings,
  })
})
