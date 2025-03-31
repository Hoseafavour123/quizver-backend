"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = exports.getAllUsers = exports.updateUser = exports.deleteUser = exports.getUserHandler = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const http_1 = require("../constants/http");
const catchErrors_1 = __importDefault(require("../utils/catchErrors"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const bcrypt_1 = require("../utils/bcrypt");
const mongoose_1 = __importDefault(require("mongoose"));
const completedQuiz_1 = __importDefault(require("../models/completedQuiz"));
exports.getUserHandler = (0, catchErrors_1.default)(async (req, res) => {
    const user = await user_model_1.default.findById(req.userId);
    (0, appAssert_1.default)(user, http_1.NOT_FOUND, 'User not found');
    return res.status(http_1.OK).json(user.omitPassword());
});
// Delete a user
exports.deleteUser = (0, catchErrors_1.default)(async (req, res) => {
    const { id } = req.params;
    const user = await user_model_1.default.findByIdAndDelete(id);
    (0, appAssert_1.default)(user, http_1.NOT_FOUND, 'The user does not exist');
    res.status(200).json({ message: 'User deleted successfully' });
});
// Update a user
exports.updateUser = (0, catchErrors_1.default)(async (req, res) => {
    const { firstName, lastName, password, email, ...restData } = req.body;
    const user = await user_model_1.default.findById(req.userId);
    (0, appAssert_1.default)(user, http_1.NOT_FOUND, 'User not found');
    let imageInfo = user.imageInfo;
    if (req.file) {
        if (imageInfo?.imageId) {
            await cloudinary_1.default.v2.uploader.destroy(imageInfo.imageId);
        }
        const result = await cloudinary_1.default.v2.uploader.upload(req.file.path, {
            folder: 'users',
        });
        imageInfo = {
            imageUrl: result.secure_url,
            imageId: result.public_id,
        };
    }
    const updateFields = {
        firstName,
        lastName,
        email,
        ...restData,
        ...(imageInfo && { imageInfo }),
    };
    if (password) {
        updateFields.password = await (0, bcrypt_1.hashValue)(password);
    }
    const updatedUser = await user_model_1.default.findOneAndUpdate({ _id: req.userId }, updateFields, { new: true, runValidators: true });
    (0, appAssert_1.default)(updatedUser, http_1.NOT_FOUND, 'User not found');
    return res.status(200).json({ volunteer: updatedUser });
});
exports.getAllUsers = (0, catchErrors_1.default)(async (req, res) => {
    const users = await user_model_1.default.find();
    res.status(200).json({ users });
});
exports.getStats = (0, catchErrors_1.default)(async (req, res) => {
    const userId = req.userId;
    (0, appAssert_1.default)(userId, 400, 'User ID is required');
    if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }
    // Determine time filter
    const { filter = 'weekly' } = req.query;
    const today = new Date();
    let startDate;
    if (filter === 'weekly') {
        startDate = new Date(today.setDate(today.getDate() - today.getDay())); // Start of the current week (Sunday)
    }
    else if (filter === 'daily') {
        startDate = new Date(today.setHours(0, 0, 0, 0)); // Start of today
    }
    else if (filter === 'monthly') {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1); // Start of the current month
    }
    else {
        return res.status(400).json({ message: 'Invalid filter type' });
    }
    //all time
    const allTimeStats = await completedQuiz_1.default.find({ userId });
    // Fetch user quiz stats within the time frame
    // const userStats = await CompletedQuiz.find({
    //   userId,
    //   createdAt: { $gte: startDate },
    // })
    (0, appAssert_1.default)(allTimeStats.length, 400, 'No quizzes found for this time frame');
    const highestScore = Math.max(...allTimeStats.map((q) => q.score), 0);
    const totalQuizzesTaken = allTimeStats.length;
    // Fetch leaderboard rankings
    const allScores = await completedQuiz_1.default.aggregate([
        {
            $group: {
                _id: '$userId',
                totalScore: { $sum: '$score' },
            },
        },
        { $sort: { totalScore: -1 } },
    ]);
    // Get user rank
    const userIndex = allScores.findIndex((user) => user._id.toString() === userId);
    const userRank = userIndex !== -1 ? userIndex + 1 : null;
    // Aggregate scores by day of the week
    const weeklyStats = await completedQuiz_1.default.aggregate([
        {
            $match: { userId, createdAt: { $gte: startDate } },
        },
        {
            $group: {
                _id: { $dayOfWeek: '$createdAt' },
                totalScore: { $sum: '$score' },
                quizzesTaken: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);
    // Format weekly scores
    const formattedStats = Array(7)
        .fill(0)
        .map((_, i) => ({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
        score: weeklyStats.find((s) => s._id === i + 1)?.totalScore || 0,
        quizzes: weeklyStats.find((s) => s._id === i + 1)?.quizzesTaken || 0,
    }));
    return res.json({
        highestScore,
        totalQuizzesTaken,
        userRank,
        formattedStats,
    });
});
