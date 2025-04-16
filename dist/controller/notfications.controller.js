"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getNotifications = void 0;
const notification_model_1 = require("../models/notification.model");
const catchErrors_1 = __importDefault(require("../utils/catchErrors"));
// Get all notifications for logged-in user
exports.getNotifications = (0, catchErrors_1.default)(async (req, res) => {
    const { userId } = req.params;
    const notifications = await notification_model_1.Notification.find({
        $or: [
            { userId: userId }, // personal notifications
            { userId: { $exists: false } }, // general notifications
        ],
    }).sort({ createdAt: -1 }).lean();
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
