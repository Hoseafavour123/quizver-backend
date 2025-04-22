"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminStats = exports.deleteAdmin = exports.getAllAdmins = exports.updateAdmin = exports.getAdminHandler = void 0;
const admin_model_1 = __importDefault(require("../models/admin.model"));
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const http_1 = require("../constants/http");
const catchErrors_1 = __importDefault(require("../utils/catchErrors"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const bcrypt_1 = require("../utils/bcrypt");
const user_model_1 = __importDefault(require("../models/user.model"));
const quiz_model_1 = __importDefault(require("../models/quiz.model"));
const payment_model_1 = __importDefault(require("../models/payment.model"));
exports.getAdminHandler = (0, catchErrors_1.default)(async (req, res) => {
    const admin = await admin_model_1.default.findById(req.userId);
    (0, appAssert_1.default)(admin, http_1.NOT_FOUND, 'Organisation not found');
    return res.status(http_1.OK).json(admin.omitPassword());
});
exports.updateAdmin = (0, catchErrors_1.default)(async (req, res) => {
    const { name, email, password, ...restData } = req.body;
    const admin = await admin_model_1.default.findById(req.userId);
    (0, appAssert_1.default)(admin, http_1.NOT_FOUND, 'Admin not found');
    let imageInfo = admin.imageInfo;
    if (req.file) {
        if (imageInfo?.imageId) {
            await cloudinary_1.default.v2.uploader.destroy(imageInfo.imageId);
        }
        const result = await cloudinary_1.default.v2.uploader.upload(req.file.path, {
            folder: 'admin',
        });
        imageInfo = {
            imageUrl: result.secure_url,
            imageId: result.public_id,
        };
    }
    const updateFields = {
        name,
        email,
        ...restData,
        ...(imageInfo && { imageInfo }),
    };
    if (password) {
        updateFields.password = await (0, bcrypt_1.hashValue)(password);
    }
    const updatedAdmin = await admin_model_1.default.findOneAndUpdate({ _id: req.userId }, updateFields, { new: true, runValidators: true });
    (0, appAssert_1.default)(updatedAdmin, http_1.NOT_FOUND, 'Admin not found');
    return res.status(200).json({ admin: updatedAdmin });
});
exports.getAllAdmins = (0, catchErrors_1.default)(async (req, res) => {
    const chiefAdmin = await admin_model_1.default.findOne({
        role: 'chief_admin',
        _id: req.userId
    });
    if (!chiefAdmin) {
        return res.status(403).json({ message: 'Access denied' });
    }
    const admins = await admin_model_1.default.find({}).select('-password');
    res.json(admins);
});
exports.deleteAdmin = (0, catchErrors_1.default)(async (req, res) => {
    const { id } = req.params;
    const chiefAdmin = await admin_model_1.default.findOne({
        role: 'chief_admin',
        _id: req.userId,
    });
    if (!chiefAdmin) {
        return res.status(403).json({ message: 'Access denied' });
    }
    if (chiefAdmin._id == req.params.id) {
        return res.status(403).json({ message: 'Cannot delete chief admin' });
    }
    const admin = await admin_model_1.default.findByIdAndDelete(id);
    (0, appAssert_1.default)(admin, http_1.NOT_FOUND, 'The admin does not exist');
    res.status(200).json({ message: 'admin deleted successfully' });
});
exports.getAdminStats = (0, catchErrors_1.default)(async (req, res) => {
    const totalUsers = await user_model_1.default.countDocuments();
    const newUsersThisMonth = await user_model_1.default.countDocuments({
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });
    const totalQuizzes = await quiz_model_1.default.countDocuments();
    const newQuizzesThisMonth = await quiz_model_1.default.countDocuments({
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });
    const totalAdmins = await admin_model_1.default.countDocuments({});
    // User registration data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    const userRegistrations = await user_model_1.default.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);
    const formattedRegistrations = userRegistrations.map((entry) => ({
        month: entry._id,
        count: entry.count
    }));
    const total = await payment_model_1.default.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]);
    console.log('total: ', total);
    const totalEarnings = total[0]?.totalAmount || 0;
    console.log('earnings: ', totalEarnings);
    res.json({
        totalEarnings,
        totalUsers,
        newUsersThisMonth,
        totalQuizzes,
        newQuizzesThisMonth,
        totalAdmins,
        userRegistrations: formattedRegistrations
    });
});
