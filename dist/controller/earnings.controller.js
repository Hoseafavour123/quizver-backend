"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminEarnings = exports.getUserEarnings = void 0;
const earnings_model_1 = require("../models/earnings.model");
const payment_model_1 = __importDefault(require("../models/payment.model"));
const catchErrors_1 = __importDefault(require("../utils/catchErrors"));
exports.getUserEarnings = (0, catchErrors_1.default)(async (req, res) => {
    const userId = req.userId;
    const earnings = await earnings_model_1.Earning.find({ userId })
        .populate('quizId', 'title')
        .sort({ earnedAt: -1 });
    if (!earnings) {
        return res.json({
            totalEarned: 0,
            totalQuizzes: 0,
            earnings: []
        });
    }
    const totalEarned = earnings.reduce((sum, e) => sum + e.amount, 0);
    return res.json({
        totalEarned,
        totalQuizzes: earnings.length,
        earnings,
    });
});
exports.getAdminEarnings = (0, catchErrors_1.default)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [payments, totalPayments] = await Promise.all([
        payment_model_1.default.find({ status: 'success' })
            .populate('userId', 'firstName lastName email')
            .populate('quizId', 'title')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        payment_model_1.default.countDocuments({ status: 'success' }),
    ]);
    const totalEarnings = await payment_model_1.default.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    res.json({
        totalEarnings: totalEarnings[0]?.total || 0,
        payments,
        currentPage: page,
        totalPages: Math.ceil(totalPayments / limit),
    });
});
