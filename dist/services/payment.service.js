"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const payment_model_1 = __importDefault(require("../models/payment.model"));
const payment_1 = require("../utils/payments/payment");
const appAssert_1 = __importDefault(require("../utils/appAssert"));
class PaymentService {
    async startPayment(data) {
        try {
            const form = {
                amount: data.amount * 100, // Convert to kobo (smallest unit for Paystack)
                email: data.email,
                metadata: {
                    full_name: data.full_name,
                    quizId: data.quizId,
                    userId: data.userId,
                },
                //callback_url: 'http://localhost:5173/user/payment/verify',
                callback_url: 'https://quizver.vercel.app/user/payment/verify'
            };
            form.metadata = { full_name: data.full_name, quizId: form.metadata?.quizId, userId: form.metadata?.userId };
            form.amount *= 100; // Convert to kobo (smallest unit for Paystack)
            const response = await (0, payment_1.initializePayment)(form);
            return response;
        }
        catch (error) {
            error.source = 'Start Payment Service';
            throw error;
        }
    }
    async createPayment(reference) {
        (0, appAssert_1.default)(reference, 400, 'No reference provided!');
        try {
            const response = await (0, payment_1.verifyPayment)(reference);
            if (!response.status || !response.data) {
                throw new Error('Payment verification failed');
            }
            const { reference: paymentReference, amount, status } = response.data;
            const { email } = response.data.customer;
            const { userId, quizId, full_name } = response.data.metadata;
            const newPayment = new payment_model_1.default({
                reference: paymentReference,
                full_name,
                amount: amount / 100,
                email,
                quizId,
                userId,
                status,
            });
            await newPayment.save();
            return newPayment;
        }
        catch (error) {
            error.source = 'Create Payment Service';
            throw error;
        }
    }
    async paymentReceipt(reference) {
        try {
            const transaction = await payment_model_1.default.findOne({ reference });
            return transaction;
        }
        catch (error) {
            error.source = 'Payment Receipt';
            throw error;
        }
    }
}
exports.default = PaymentService;
