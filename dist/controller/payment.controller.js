"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyUsersForPayment = exports.getPayment = exports.createPayment = exports.startPayment = void 0;
const payment_service_1 = __importDefault(require("../services/payment.service"));
const catchErrors_1 = __importDefault(require("../utils/catchErrors"));
const user_model_1 = __importDefault(require("../models/user.model"));
const quiz_model_1 = __importDefault(require("../models/quiz.model"));
const sendMail_1 = require("../utils/sendMail");
// Initialize PaymentService instance
const paymentInstance = new payment_service_1.default();
const startPayment = async (req, res) => {
    try {
        const response = await paymentInstance.startPayment(req.body);
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
    const quizPaymentUrl = `http://localhost:5173/quiz/payment/${quizId}`;
    users.forEach((user) => {
        (0, sendMail_1.sendMail)({
            email: user.email,
            html: `<h2>A new quiz will go live soon!</h2> <br />Title: <strong>${quiz?.title} <br />Category: ${quiz?.category} </strong> <br/> <a href="${quizPaymentUrl}"> Register Now </a>`,
            subject: 'New Quiz Update',
        });
    });
    await quiz_model_1.default.findOneAndUpdate({ id: quizId }, { notificationSent: true });
    return res.json({ message: 'Successfully notified users ' });
});
