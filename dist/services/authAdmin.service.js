"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.sendPasswordResetEmail = exports.verifyEmail = exports.refreshUserAccessToken = exports.loginUser = exports.createAccount = void 0;
const http_1 = require("../constants/http");
const session_model_1 = __importDefault(require("../models/session.model"));
const admin_model_1 = __importDefault(require("../models/admin.model"));
const verificationCode_model_1 = __importDefault(require("../models/verificationCode.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const jwt_1 = require("../utils/jwt");
const date_1 = require("../utils/date");
const sendMail_1 = require("../utils/sendMail");
const emailTtemplates_1 = require("../utils/emailTtemplates");
const bcrypt_1 = require("../utils/bcrypt");
const createAccount = async (data) => {
    const existingAdmin = await admin_model_1.default.exists({ email: data.email });
    (0, appAssert_1.default)(!existingAdmin, http_1.CONFLICT, 'User with this email already exists');
    const admin = await admin_model_1.default.create({
        name: data.name,
        email: data.email,
        password: data.password,
    });
    const userId = admin._id;
    const verificationCode = await verificationCode_model_1.default.create({
        userId,
        type: "email_verification" /* VerificationCodeTypes.EmailVerification */,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });
    const url = `${process.env.APP_ORIGIN}/admin/email/verify/${verificationCode._id}`;
    await (0, sendMail_1.sendMail)({ email: admin.email, ...(0, emailTtemplates_1.getVerifyEmailTemplate)(url) })
        .then((res) => console.log('Verification email sent'))
        .catch((err) => (0, appAssert_1.default)(!err, http_1.INTERNAL_SERVER_ERROR, 'Failed to send verification email'));
    const session = await session_model_1.default.create({
        userId,
        userAgent: data.userAgent,
    });
    const refreshToken = jsonwebtoken_1.default.sign({ sessionId: session._id }, process.env.JWT_TOKEN_SECRET, {
        audience: 'user',
        expiresIn: '30d',
    });
    const accessToken = jsonwebtoken_1.default.sign({ sessionId: session._id, userId }, process.env.JWT_TOKEN_SECRET, { audience: 'user', expiresIn: '30min' });
    return {
        admin: admin.omitPassword(),
        accessToken,
        refreshToken,
    };
};
exports.createAccount = createAccount;
const loginUser = async ({ email, password, userAgent, }) => {
    const admin = await admin_model_1.default.findOne({ email });
    (0, appAssert_1.default)(admin, http_1.UNAUTHORIZED, 'Invalid email or password');
    const isValid = await admin.comparePassword(password);
    (0, appAssert_1.default)(isValid, http_1.UNAUTHORIZED, 'Invalid email or password');
    const userId = admin._id;
    const session = await session_model_1.default.create({
        userId,
        userAgent,
    });
    const sessionInfo = {
        sessionId: session._id,
    };
    const refreshToken = jsonwebtoken_1.default.sign({ ...sessionInfo }, process.env.JWT_TOKEN_SECRET, {
        audience: 'user',
        expiresIn: '30d',
    });
    const accessToken = jsonwebtoken_1.default.sign({ ...sessionInfo, userId }, process.env.JWT_TOKEN_SECRET, { audience: 'user', expiresIn: '30min' });
    return {
        admin: admin.omitPassword(),
        accessToken,
        refreshToken,
    };
};
exports.loginUser = loginUser;
const refreshUserAccessToken = async (refreshToken) => {
    const { payload } = (0, jwt_1.verifyToken)(refreshToken, {
        secret: process.env.JWT_TOKEN_SECRET,
    });
    (0, appAssert_1.default)(payload, http_1.UNAUTHORIZED, 'Invalid refresh token');
    const session = await session_model_1.default.findById(payload.sessionId);
    (0, appAssert_1.default)(session && session.expiresAt.getTime() > Date.now(), http_1.UNAUTHORIZED, 'Session Expired');
    const sessionNeedsRefresh = session.expiresAt.getTime() - Date.now() <= 24 * 60 * 60 * 1000;
    let newRefreshToken;
    if (sessionNeedsRefresh) {
        session.expiresAt = (0, date_1.thirtyDaysFromNow)();
        await session.save();
        newRefreshToken = jsonwebtoken_1.default.sign({ sessionId: session._id }, process.env.JWT_TOKEN_SECRET, { expiresIn: '30d' });
    }
    const accessToken = jsonwebtoken_1.default.sign({ sessionId: session._id, userId: session.userId }, process.env.JWT_TOKEN_SECRET, { expiresIn: '30min' });
    return { accessToken, newRefreshToken: newRefreshToken || refreshToken };
};
exports.refreshUserAccessToken = refreshUserAccessToken;
const verifyEmail = async (code) => {
    const verificationCode = await verificationCode_model_1.default.findOne({
        _id: code,
        type: "email_verification" /* VerificationCodeTypes.EmailVerification */,
        expiresAt: { $gt: new Date() },
    });
    (0, appAssert_1.default)(verificationCode, http_1.UNAUTHORIZED, 'Invalid or expired verification code');
    const updatedAdmin = await admin_model_1.default.findByIdAndUpdate(verificationCode.userId, { verified: true }, { new: true });
    (0, appAssert_1.default)(updatedAdmin, http_1.INTERNAL_SERVER_ERROR, 'Failed to verify email');
    await verificationCode.deleteOne();
    return {
        admin: updatedAdmin.omitPassword(),
    };
};
exports.verifyEmail = verifyEmail;
const sendPasswordResetEmail = async (email) => {
    const admin = await admin_model_1.default.findOne({ email });
    (0, appAssert_1.default)(admin, http_1.NOT_FOUND, 'User does not exist');
    const fiveMinsAgo = (0, date_1.fiveMinutesAgo)();
    const count = await verificationCode_model_1.default.countDocuments({
        userId: admin._id,
        type: "password_reset" /* VerificationCodeTypes.PasswordReset */,
        createdAt: { $gt: fiveMinsAgo },
    });
    (0, appAssert_1.default)(count <= 1, http_1.TOO_MANY_REQUESTS, 'Too many requests, try again in 5 minutes');
    const expiresAt = (0, date_1.oneHourFromNow)();
    const verificationCode = await verificationCode_model_1.default.create({
        userId: admin._id,
        type: "password_reset" /* VerificationCodeTypes.PasswordReset */,
        expiresAt,
    });
    const url = `${process.env.APP_ORIGIN}/password/reset?code=${verificationCode._id}&exp=${expiresAt.getTime()}`;
    await (0, sendMail_1.sendMail)({ email, ...(0, emailTtemplates_1.getPasswordResetTemplate)(url) })
        .then((res) => console.log('Password reset email sent'))
        .catch((err) => (0, appAssert_1.default)(!err, http_1.INTERNAL_SERVER_ERROR, 'Failed to send password reset email'));
    return { url };
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const resetPassword = async (code, password) => {
    const verificationCode = await verificationCode_model_1.default.findOne({
        _id: code,
        type: "password_reset" /* VerificationCodeTypes.PasswordReset */,
        expiresAt: { $gt: new Date() },
    });
    (0, appAssert_1.default)(verificationCode, http_1.UNAUTHORIZED, 'Invalid or expired verification code');
    const updatedAdmin = await admin_model_1.default.findByIdAndUpdate(verificationCode.userId, { password: await (0, bcrypt_1.hashValue)(password) });
    (0, appAssert_1.default)(updatedAdmin, http_1.INTERNAL_SERVER_ERROR, 'Failed to reset password');
    await verificationCode.deleteOne();
    await session_model_1.default.deleteMany({ userId: updatedAdmin._id });
    return {
        admin: updatedAdmin.omitPassword(),
    };
};
exports.resetPassword = resetPassword;
