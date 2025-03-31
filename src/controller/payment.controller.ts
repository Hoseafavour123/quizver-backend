import { Request, Response } from 'express'
import PaymentService from '../services/payment.service'
import catchErrors from '../utils/catchErrors'
import UserModel from '../models/user.model'
import QuizModel from '../models/quiz.model'
import { sendMail } from '../utils/sendMail'
import Payment from '../models/payment.model'
import { getNewQuizNotificationTemplate } from '../utils/emailTemplates'

// Initialize PaymentService instance
const paymentInstance = new PaymentService()

export const startPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log(req.body, req.params.quizId, req.userId)
  try {
    const response = await paymentInstance.startPayment({...req.body, userId: req.userId, quizId: req.params.quizId})
    res.status(201).json({ status: 'Success', data: response })
  } catch (error: any) {
    res.status(500).json({ status: 'Failed', message: error.message })
  }
}

export const createPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const response = await paymentInstance.createPayment(
      req.query.reference as string
    )
    res.status(201).json({ status: 'Success', data: response })
  } catch (error: any) {
    res.status(500).json({ status: 'Failed', message: error.message })
  }
}

export const getPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const response = await paymentInstance.paymentReceipt(req.body.reference)
    res.status(201).json({ status: 'Success', data: response })
  } catch (error: any) {
    res.status(500).json({ status: 'Failed', message: error.message })
  }
}

export const notifyUsersForPayment = catchErrors(async (req, res) => {
  const quizId = req.params.quizId

  const users = await UserModel.find({})
  const quiz = await QuizModel.findOne({ _id: quizId })

  const quizPaymentUrl = `https://quizver.vercel.app/quiz/pay/${quizId}`

  users.forEach((user) => {
    return sendMail({
      email: user.email,
      ...getNewQuizNotificationTemplate(quiz?.title || 'New Quiz', quizPaymentUrl),
    })
  })

  await QuizModel.findOneAndUpdate({ id: quizId }, { notificationSent: true })

  return res.json({ message: 'Successfully notified users '})
})


export const isQuizPaidFor = catchErrors(async (req, res) => {
  const quizId = req.params.quizId
  const userId = req.userId

  const payment = await Payment.findOne({ quizId, userId })
  if (!payment) {
    return res.json({ isQuizPaidFor: false, message: 'Payment not found' })
  }
  return res.json({isQuizPaidFor: true, message: 'Payment verified successfully'})
})
