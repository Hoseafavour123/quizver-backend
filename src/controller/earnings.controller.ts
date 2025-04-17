import { Earning } from '../models/earnings.model'
import Payment from '../models/payment.model'
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

export const getAdminEarnings = catchErrors(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const skip = (page - 1) * limit

  const [payments, totalPayments] = await Promise.all([
    Payment.find({ status: 'success' })
      .populate('userId', 'firstName lastName email')
      .populate('quizId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments({ status: 'success' }),
  ])

  const totalEarnings = await Payment.aggregate([
    { $match: { status: 'success' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ])

  res.json({
    totalEarnings: totalEarnings[0]?.total || 0,
    payments,
    currentPage: page,
    totalPages: Math.ceil(totalPayments / limit),
  })
})