"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getNotifications = void 0;
const notification_model_1 = require("../models/notification.model");
const user_model_1 = __importDefault(require("../models/user.model"));
const catchErrors_1 = __importDefault(require("../utils/catchErrors"));
exports.getNotifications = (0, catchErrors_1.default)(async (req, res) => {
    const { userId } = req.params;
    const user = await user_model_1.default.findById(userId).select('createdAt');
    if (!user)
        return res.status(404).json({ message: 'User not found' });
    const notifications = await notification_model_1.Notification.find({
        createdAt: { $gt: user.createdAt },
        $or: [
            { userId: userId },
            { userId: { $exists: false } },
        ],
    })
        .sort({ createdAt: -1 })
        .lean();
    res.json(notifications);
});
exports.markAsRead = (0, catchErrors_1.default)(async (req, res) => {
    const userId = req.params.userId; // Correct way to access `userId` from URL
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required.' });
    }
    // Mark all unread notifications for this user as read by adding userId to readBy
    await notification_model_1.Notification.updateMany({
        readBy: { $ne: userId }, // user hasn't read it yet
        $or: [
            { userId: userId }, // personal notification
            { userId: { $exists: false } }, // general notification
        ],
    }, {
        $addToSet: { readBy: userId }, // add to readBy if not already there
    });
    res.json({ success: true });
});
