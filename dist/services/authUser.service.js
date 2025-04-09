"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.sendPasswordResetEmail = exports.verifyEmail = exports.refreshUserAccessToken = exports.loginUser = exports.createAccount = void 0;
const http_1 = require("../constants/http");
const session_model_1 = __importDefault(require("../models/session.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const verificationCode_model_1 = __importDefault(require("../models/verificationCode.model"));
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const jwt_1 = require("../utils/jwt");
const date_1 = require("../utils/date");
const sendMail_1 = require("../utils/sendMail");
const emailTtemplates_1 = require("../utils/emailTtemplates");
const bcrypt_1 = require("../utils/bcrypt");
const createAccount = async (data) => {
    const existingUser = await user_model_1.default.exists({ email: data.email });
    (0, appAssert_1.default)(!existingUser, http_1.CONFLICT, 'User with this email already exists');
    const user = await user_model_1.default.create({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
    });
    const userId = user._id;
    const verificationCode = await verificationCode_model_1.default.create({
        userId,
        type: "email_verification" /* VerificationCodeTypes.EmailVerification */,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });
    const url = `${process.env.APP_ORIGIN}/email/verify/${verificationCode._id}`;
    await (0, sendMail_1.sendMail)({ email: user.email, ...(0, emailTtemplates_1.getVerifyEmailTemplate)(url) })
        .then((res) => console.log('Verification email sent'))
        .catch((err) => (0, appAssert_1.default)(!err, http_1.INTERNAL_SERVER_ERROR, 'Failed to send verification email'));
    const session = await session_model_1.default.create({
        userId,
        userAgent: data.userAgent,
    });
    const refreshToken = (0, jwt_1.signToken)({
        sessionId: session._id,
    }, jwt_1.refreshTokenSignOptions);
    const accessToken = (0, jwt_1.signToken)({
        userId,
        sessionId: session._id,
    });
    return {
        user: user.omitPassword(),
        accessToken,
        refreshToken,
    };
};
exports.createAccount = createAccount;
const loginUser = async ({ email, password, userAgent, }) => {
    const user = await user_model_1.default.findOne({ email });
    (0, appAssert_1.default)(user, http_1.UNAUTHORIZED, 'Invalid email or password');
    const isValid = await user.comparePassword(password);
    (0, appAssert_1.default)(isValid, http_1.UNAUTHORIZED, 'Invalid email or password');
    const userId = user._id;
    const session = await session_model_1.default.create({
        userId,
        userAgent,
    });
    const sessionInfo = {
        sessionId: session._id,
    };
    const refreshToken = (0, jwt_1.signToken)(sessionInfo, jwt_1.refreshTokenSignOptions);
    const accessToken = (0, jwt_1.signToken)({
        ...sessionInfo,
        userId,
    });
    return {
        user: user.omitPassword(),
        accessToken,
        refreshToken,
    };
};
exports.loginUser = loginUser;
const refreshUserAccessToken = async (refreshToken) => {
    const { payload } = (0, jwt_1.verifyToken)(refreshToken, {
        secret: jwt_1.refreshTokenSignOptions.secret,
    });
    (0, appAssert_1.default)(payload, http_1.UNAUTHORIZED, 'Invalid refresh token');
    const session = await session_model_1.default.findById(payload.sessionId);
    const now = Date.now();
    (0, appAssert_1.default)(session && session.expiresAt.getTime() > now, http_1.UNAUTHORIZED, 'Session expired');
    // refresh the session if it expires in the next 24hrs
    const sessionNeedsRefresh = session.expiresAt.getTime() - now <= date_1.ONE_DAY_MS;
    if (sessionNeedsRefresh) {
        session.expiresAt = (0, date_1.thirtyDaysFromNow)();
        await session.save();
    }
    const newRefreshToken = sessionNeedsRefresh
        ? (0, jwt_1.signToken)({
            sessionId: session._id,
        }, jwt_1.refreshTokenSignOptions)
        : undefined;
    const accessToken = (0, jwt_1.signToken)({
        userId: session.userId,
        sessionId: session._id,
    });
    return {
        accessToken,
        newRefreshToken,
    };
};
exports.refreshUserAccessToken = refreshUserAccessToken;
const verifyEmail = async (code) => {
    const verificationCode = await verificationCode_model_1.default.findOne({
        _id: code,
        type: "email_verification" /* VerificationCodeTypes.EmailVerification */,
        expiresAt: { $gt: new Date() },
    });
    (0, appAssert_1.default)(verificationCode, http_1.UNAUTHORIZED, 'Invalid or expired verification code');
    const updatedUser = await user_model_1.default.findByIdAndUpdate(verificationCode.userId, { verified: true }, { new: true });
    (0, appAssert_1.default)(updatedUser, http_1.INTERNAL_SERVER_ERROR, 'Failed to verify email');
    await verificationCode.deleteOne();
    return {
        volunteer: updatedUser.omitPassword(),
    };
};
exports.verifyEmail = verifyEmail;
const sendPasswordResetEmail = async (email) => {
    const user = await user_model_1.default.findOne({ email });
    (0, appAssert_1.default)(user, http_1.NOT_FOUND, 'User does not exist');
    const fiveMinsAgo = (0, date_1.fiveMinutesAgo)();
    const count = await verificationCode_model_1.default.countDocuments({
        userId: user?._id,
        type: "password_reset" /* VerificationCodeTypes.PasswordReset */,
        createdAt: { $gt: fiveMinsAgo },
    });
    (0, appAssert_1.default)(count <= 1, http_1.TOO_MANY_REQUESTS, 'Too many requests, try again in 5 minutes');
    const expiresAt = (0, date_1.oneHourFromNow)();
    const verificationCode = await verificationCode_model_1.default.create({
        userId: user?._id,
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
    const updatedUser = await user_model_1.default.findByIdAndUpdate(verificationCode.userId, { password: await (0, bcrypt_1.hashValue)(password) });
    (0, appAssert_1.default)(updatedUser, http_1.INTERNAL_SERVER_ERROR, 'Failed to reset password');
    await verificationCode.deleteOne();
    await session_model_1.default.deleteMany({ userId: updatedUser._id });
    return {
        user: updatedUser.omitPassword(),
    };
};
exports.resetPassword = resetPassword;
