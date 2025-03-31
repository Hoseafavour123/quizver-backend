import axios from 'axios'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_TEST_SECRET_KEY as string

export interface PaymentForm {
  callback_url: string
  amount: number
  email: string
  metadata?: { full_name: string, quizId?: mongoose.Types.ObjectId, userId?: mongoose.Types.ObjectId }
}

export const initializePayment = async (form: PaymentForm): Promise<any> => {
  try {

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      form,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data
  } catch (error: any) {
    throw new Error(
      `Payment Initialization Failed: ${
        error.response?.data?.message || error.message
      }`
    )
  }
}

export const verifyPayment = async (reference: string): Promise<any> => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference
      )}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data
  } catch (error: any) {
    throw new Error(
      `Payment Verification Failed: ${
        error.response?.data?.message || error.message
      }`
    )
  }
}
