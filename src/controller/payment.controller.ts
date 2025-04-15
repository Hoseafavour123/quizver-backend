import { Request, Response } from 'express'
import PaymentService from '../services/payment.service'
import catchErrors from '../utils/catchErrors'
import UserModel from '../models/user.model'
import QuizModel from '../models/quiz.model'
import { sendMail } from '../utils/sendMail'
import Payment from '../models/payment.model'
import PaymentProfile from '../models/paymentProfile.model'
import { getNewQuizNotificationTemplate } from '../utils/emailTemplates'
import appAssert from '../utils/appAssert'

// Initialize PaymentService instance
const paymentInstance = new PaymentService()

export const getBanks = async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await paymentInstance.getBanks()

    const banks = response.data.map((bank: any) => ({
      name: bank.name,
      code: bank.code,
    }))

    res.status(200).json(banks)
  } catch (error: any) {
    res.status(500).json({ status: 'Failed', message: error.message })
  }
}

export const createTransferRecipient = catchErrors(async (req, res) => {
  const { accountNumber, bankCode, email, fullName, userId } = req.body

  const data = {
    accountNumber,
    bankCode,
    email,
    fullName,
    metadata: { userId },
  }

  const recipient = await paymentInstance.createTransferRecipient(data)
  appAssert(recipient, 500, 'Failed to create transfer recipient')
  return res.json({ recipient })
})

export const initiateTransfer = catchErrors(async (req, res) => {
  const { amount, recipientCode, email } = req.body

  const data = {
    amount,
    recipientCode,
    email,
  }

  const transfer = await paymentInstance.initiateTransfer(data)
  appAssert(transfer, 500, 'Failed to initiate transfer')
  console.log(transfer)
  // return res.json({ transfer })
})

export const verifyTransfer = catchErrors(async (req, res) => {
  const { transferCode } = req.query
  const transferStatus = await paymentInstance.verifyTransfer(
    transferCode as string
  )
  res.json(transferStatus)
})

export const savePaymentprofile = async (req: Request, res: Response) => {
  try {
    const { name, accountNumber, bank } = req.body
    const bankInfo = JSON.parse(bank)

    const exisitingProfile = await PaymentProfile.findOne({ userId: req.userId })

    if (exisitingProfile) {
      await PaymentProfile.deleteOne({ userId: req.userId })

    }

    const profile = new PaymentProfile({
      name,
      accountNumber,
      bankName: bankInfo.name,
      bankCode: bankInfo.code,
      userId: req.userId,
    })

    await profile.save()

    res.status(201).json({profile})
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to save profile' })
  }
}

export const getPaymentProfile = catchErrors(async (req, res) => {
  const profile = await PaymentProfile.findOne({ userId: req.userId })
  if (profile) {
    return res.status(200).json(profile)
  }
  return res.status(400).json({ messaage: 'No profile found'})
})

export const startPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log(req.body, req.params.quizId, req.userId)
  try {
    const response = await paymentInstance.startPayment({
      ...req.body,
      userId: req.userId,
      quizId: req.params.quizId,
    })
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

  const quizPaymentUrl =
    process.env.ENVIRONMENT == 'production'
      ? `https://quizver.vercel.app/user/quiz/pay/${quizId}`
      : `http://localhost:5173/quiz/pay/${quizId}`

  // Use Promise.all to handle asynchronous email sending
  await Promise.all(
    users.map((user) =>
      sendMail({
        email: user.email,
        ...getNewQuizNotificationTemplate(
          quiz?.title || 'New Quiz',
          quizPaymentUrl,
          1
        ),
      })
    )
  )

  await QuizModel.findOneAndUpdate({ _id: quizId }, { notificationSent: true })

  return res.json({ message: 'Successfully notified users ' })
})

export const isQuizPaidFor = catchErrors(async (req, res) => {
  const quizId = req.params.quizId
  const userId = req.userId

  const payment = await Payment.findOne({ quizId, userId })
  if (!payment) {
    return res.json({ isQuizPaidFor: false, message: 'Payment not found' })
  }
  return res.json({
    isQuizPaidFor: true,
    message: 'Payment verified successfully',
  })
})
