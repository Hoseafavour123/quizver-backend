import Payment from '../models/payment.model'
import _ from 'lodash'
import {initializePayment, verifyPayment, PaymentForm} from '../utils/payments/payment'
import appAssert from '../utils/appAssert'
import mongoose from 'mongoose'

interface PaymentData {
  userId: mongoose.Types.ObjectId
  quizId: mongoose.Types.ObjectId
  amount: number
  email: string
  full_name: string
}

interface VerifyPaymentResponse {
  status: boolean
  message: string
  data?: {
    reference: string
    amount: number
    status: 'pending' | 'success' | 'failed'
    customer: { email: string }
    metadata: {
      full_name: string
      quizId: any
      userId: any
}
  }
}

class PaymentService {
  async startPayment(data: PaymentData): Promise<any> {
    try {
      const form: PaymentForm = {
        amount: data.amount * 100, // Convert to kobo (smallest unit for Paystack)
        email: data.email,
        metadata: {
          full_name: data.full_name,
          quizId: data.quizId,
          userId: data.userId,
        },
        callback_url: 'https://quizver.vercel.app/payment/verify',
      }
      form.metadata = {full_name: data.full_name, quizId: form.metadata?.quizId, userId: form.metadata?.userId }
      form.amount *= 100 // Convert to kobo (smallest unit for Paystack)

      const response = await initializePayment(form)
      return response
    } catch (error: any) {
      error.source = 'Start Payment Service'
      throw error
    }
  }

  async createPayment(reference: string): Promise<any> {
    appAssert(reference, 400, 'No reference provided!')
    
    try {
      const response: VerifyPaymentResponse = await verifyPayment(reference)

      if (!response.status || !response.data) {
        throw new Error('Payment verification failed')
      }

      const { reference: paymentReference, amount, status } = response.data
      const { email } = response.data.customer
      const { userId, quizId, full_name } = response.data.metadata
    
      const newPayment = new Payment({
        reference: paymentReference,
        full_name,
        amount: amount / 100,
        email,
        quizId,
        userId,
        status,
      })
      await newPayment.save()

      return newPayment
    } catch (error: any) {
      error.source = 'Create Payment Service'
      throw error
    }
  }

  async paymentReceipt(reference: string): Promise<any> {
    try {
      const transaction = await Payment.findOne({ reference })
      return transaction
    } catch (error: any) {
      error.source = 'Payment Receipt'
      throw error
    }
  }
}

export default PaymentService
