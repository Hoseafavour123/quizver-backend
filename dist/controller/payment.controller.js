"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isQuizPaidFor = exports.notifyUsersForPayment = exports.getPayment = exports.createPayment = exports.startPayment = exports.getPaymentProfile = exports.savePaymentprofile = exports.verifyTransfer = exports.initiateTransfer = exports.createTransferRecipient = exports.getBanks = void 0;
const payment_service_1 = __importDefault(require("../services/payment.service"));
const catchErrors_1 = __importDefault(require("../utils/catchErrors"));
const user_model_1 = __importDefault(require("../models/user.model"));
const quiz_model_1 = __importDefault(require("../models/quiz.model"));
const sendMail_1 = require("../utils/sendMail");
const payment_model_1 = __importDefault(require("../models/payment.model"));
const paymentProfile_model_1 = __importDefault(require("../models/paymentProfile.model"));
const notification_model_1 = require("../models/notification.model");
const emailTemplates_1 = require("../utils/emailTemplates");
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const completedQuiz_1 = __importDefault(require("../models/completedQuiz"));
const earnings_model_1 = require("../models/earnings.model");
// Initialize PaymentService instance
const paymentInstance = new payment_service_1.default();
const getBanks = async (req, res) => {
    try {
        const response = await paymentInstance.getBanks();
        const banks = response.data.map((bank) => ({
            name: bank.name,
            code: bank.code,
        }));
        res.status(200).json(banks);
    }
    catch (error) {
        res.status(500).json({ status: 'Failed', message: error.message });
    }
};
exports.getBanks = getBanks;
exports.createTransferRecipient = (0, catchErrors_1.default)(async (req, res) => {
    const { email } = req.body;
    const { userId } = req.query;
    console.log(email);
    const userPaymentProfile = await paymentProfile_model_1.default.findOne({ userId });
    if (!userPaymentProfile) {
        return res.status(404).json({ message: 'Payment profile not found' });
    }
    (0, appAssert_1.default)(userPaymentProfile, 404, 'Payment profile not found');
    const data = {
        accountNumber: userPaymentProfile.accountNumber,
        bankCode: userPaymentProfile.bankCode,
        email,
        fullName: userPaymentProfile.name,
        metadata: { userId: userPaymentProfile.userId },
    };
    const recipient = await paymentInstance.createTransferRecipient(data);
    (0, appAssert_1.default)(recipient, 500, 'Failed to create transfer recipient');
    return res.json({ recipient: recipient.data });
});
exports.initiateTransfer = (0, catchErrors_1.default)(async (req, res) => {
    const { amount, recipientCode, email, userId } = req.body;
    const quizId = req.query.quizId;
    const data = {
        amount,
        recipientCode,
        email,
    };
    const completedQuiz = await completedQuiz_1.default.findOne({
        quizId,
        userId,
    });
    (0, appAssert_1.default)(completedQuiz, 404, 'Quiz result not found for user');
    if (!completedQuiz) {
        return res.status(404).json({ message: 'Quiz result not found for user' });
    }
    if (completedQuiz.rewarded) {
        return res.status(400).json({ message: 'User has already been rewarded' });
    }
    const transfer = await paymentInstance.initiateTransfer(data);
    (0, appAssert_1.default)(transfer, 401, 'Transfer not successfull');
    const earning = new earnings_model_1.Earning({
        userId,
        quizId,
        amount
    });
    await earning.save();
    const notification = new notification_model_1.Notification({
        userId,
        type: 'payment',
        title: 'Congratulations! Payment Sent!',
        message: `You just received a payment of N${amount} for being a top scorer in the recnt quiz`
    });
    await notification.save();
    completedQuiz.rewarded = true;
    await completedQuiz.save();
    return res.json({ transfer });
});
exports.verifyTransfer = (0, catchErrors_1.default)(async (req, res) => {
    const { transferCode } = req.query;
    const transferStatus = await paymentInstance.verifyTransfer(transferCode);
    res.json(transferStatus);
});
const savePaymentprofile = async (req, res) => {
    try {
        const { name, accountNumber, bank } = req.body;
        const bankInfo = JSON.parse(bank);
        const exisitingProfile = await paymentProfile_model_1.default.findOne({ userId: req.userId });
        if (exisitingProfile) {
            await paymentProfile_model_1.default.deleteOne({ userId: req.userId });
        }
        const profile = new paymentProfile_model_1.default({
            name,
            accountNumber,
            bankName: bankInfo.name,
            bankCode: bankInfo.code,
            userId: req.userId,
        });
        await profile.save();
        res.status(201).json({ profile });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to save profile' });
    }
};
exports.savePaymentprofile = savePaymentprofile;
exports.getPaymentProfile = (0, catchErrors_1.default)(async (req, res) => {
    const profile = await paymentProfile_model_1.default.findOne({ userId: req.userId });
    if (profile) {
        return res.status(200).json(profile);
    }
    return res.status(400).json({ messaage: 'No profile found' });
});
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
