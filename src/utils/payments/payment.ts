import axios from 'axios'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY as string
//const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_TEST_SECRET_KEY as string

export interface PaymentForm {
  callback_url: string
  amount: number
  email: string
  metadata?: { full_name: string, quizId?: mongoose.Types.ObjectId, userId?: mongoose.Types.ObjectId }
}

export interface TransferData {
  amount: number
  recipientCode: string
  email: string
}


export interface RecipientData {
  bankCode: string
  accountNumber: string
  email: string
  fullName: string
  metadata?: { userId: mongoose.Types.ObjectId }
}


export const getBanks = async (): Promise<any> => {
  try {
    const response = await axios.get('https://api.paystack.co/bank', {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error: any) {
    throw new Error(
      `Bank Retrieval Failed: ${error.response?.data?.message || error.message}`
    )
  }
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



export const createTransferRecipient = async ({
  bankCode,
  accountNumber,
  email,
  fullName,
  metadata
}: RecipientData): Promise<any> => {
  try {
    const response = await axios.post(
      'https://api.paystack.co/transferrecipient',
      {
        type: 'nuban',
        name: fullName,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN', // You can set this to your preferred currency
        email,
        metadata: { userId: metadata?.userId }
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(
      `Recipient Creation Failed: ${error.response?.data?.message || error.message}`
    );
  }
};




export const initiateTransfer = async ({
  amount,
  recipientCode,
  email
}: TransferData): Promise<any> => {
  try {
    const response = await axios.post(
      'https://api.paystack.co/transfer',
      {
        amount: amount * 100, // Amount in kobo (smallest unit)
        recipient: recipientCode,
        email,
        currency: 'NGN',
      },
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
      `Transfer Initiation Failed: ${
        error.response?.data?.message || error.message
      }`
    )
  }
}


export const verifyTransfer = async (transferCode: string): Promise<any> => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transfer/${encodeURIComponent(transferCode)}`,
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
      `Transfer Verification Failed: ${
        error.response?.data?.message || error.message
      }`
    )
  }
}

