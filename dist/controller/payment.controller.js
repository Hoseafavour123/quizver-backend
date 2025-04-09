"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isQuizPaidFor = exports.notifyUsersForPayment = exports.getPayment = exports.createPayment = exports.startPayment = void 0;
const payment_service_1 = __importDefault(require("../services/payment.service"));
const catchErrors_1 = __importDefault(require("../utils/catchErrors"));
const user_model_1 = __importDefault(require("../models/user.model"));
const quiz_model_1 = __importDefault(require("../models/quiz.model"));
const sendMail_1 = require("../utils/sendMail");
const payment_model_1 = __importDefault(require("../models/payment.model"));
const emailTemplates_1 = require("../utils/emailTemplates");
// Initialize PaymentService instance
const paymentInstance = new payment_service_1.default();
const startPayment = async (req, res) => {
    console.log(req.body, req.params.quizId, req.userId);
    try {
        const response = await paymentInstance.startPayment({
            ...req.body,
            userId: req.userId,
            quizId: req.params.quizId,
        });
        res.status(201).json({ status: 'Success', data: response });
    }
    catch (error) {
        res.status(500).json({ status: 'Failed', message: error.message });
    }
};
exports.startPayment = startPayment;
const createPayment = async (req, res) => {
    try {
        const response = await paymentInstance.createPayment(req.query.reference);
        res.status(201).json({ status: 'Success', data: response });
    }
    catch (error) {
        res.status(500).json({ status: 'Failed', message: error.message });
    }
};
exports.createPayment = createPayment;
const getPayment = async (req, res) => {
    try {
        const response = await paymentInstance.paymentReceipt(req.body.reference);
        res.status(201).json({ status: 'Success', data: response });
    }
    catch (error) {
        res.status(500).json({ status: 'Failed', message: error.message });
    }
};
exports.getPayment = getPayment;
exports.notifyUsersForPayment = (0, catchErrors_1.default)(async (req, res) => {
    const quizId = req.params.quizId;
    const users = await user_model_1.default.find({});
    const quiz = await quiz_model_1.default.findOne({ _id: quizId });
    const quizPaymentUrl = process.env.ENVIRONMENT == 'production'
        ? `https://quizver.vercel.app/user/quiz/pay/${quizId}`
        : `http://localhost:5173/quiz/pay/${quizId}`;
    // Use Promise.all to handle asynchronous email sending
    await Promise.all(users.map((user) => (0, sendMail_1.sendMail)({
        email: user.email,
        ...(0, emailTemplates_1.getNewQuizNotificationTemplate)(quiz?.title || 'New Quiz', quizPaymentUrl, 1),
    })));
    await quiz_model_1.default.findOneAndUpdate({ _id: quizId }, { notificationSent: true });
    return res.json({ message: 'Successfully notified users ' });
});
exports.isQuizPaidFor = (0, catchErrors_1.default)(async (req, res) => {
    const quizId = req.params.quizId;
    const userId = req.userId;
    const payment = await payment_model_1.default.findOne({ quizId, userId });
    if (!payment) {
        return res.json({ isQuizPaidFor: false, message: 'Payment not found' });
    }
    return res.json({
        isQuizPaidFor: true,
        message: 'Payment verified successfully',
    });
});
