"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const quizSchema = new mongoose_1.default.Schema({
    title: String,
    description: String,
    duration: Number,
    status: {
        type: String,
        enum: ['draft', 'live', 'closed', 'scheduled'],
        default: 'draft',
    },
    startTime: { type: Date, default: null },
    category: String,
    notificationSent: { type: Boolean, default: false },
    scheduledAt: {
        type: Date,
        default: null,
    },
    questions: [
        {
            image: String,
            text: String,
            options: [String],
            correctAnswer: String,
        },
    ],
}, {
    timestamps: true,
});
const QuizModel = mongoose_1.default.model('Quiz', quizSchema);
exports.default = QuizModel;
