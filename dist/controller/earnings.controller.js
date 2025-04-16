"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserEarnings = void 0;
const earnings_model_1 = require("../models/earnings.model");
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
