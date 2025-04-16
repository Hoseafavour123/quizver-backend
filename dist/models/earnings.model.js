"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Earning = void 0;
const mongoose_1 = require("mongoose");
const earningSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    quizId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    amount: { type: Number, required: true },
    earnedAt: { type: Date, default: Date.now },
}, { timestamps: true });
exports.Earning = (0, mongoose_1.model)('Earning', earningSchema);
