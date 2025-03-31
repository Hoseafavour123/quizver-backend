"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordHandler = exports.sendPasswordResetHandler = exports.verifyEmailHandler = exports.refreshHandler = exports.logoutHandler = exports.loginHandler = exports.registerHandler = void 0;
const http_1 = require("../constants/http");
const session_model_1 = __importDefault(require("../models/session.model"));
const auth_service_1 = require("../services/auth.service");
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const cookies_1 = require("../utils/cookies");
const jwt_1 = require("../utils/jwt");
const catchErrors_1 = __importDefault(require("../utils/catchErrors"));
const auth_schemas_1 = require("./auth.schemas");
exports.registerHandler = (0, catchErrors_1.default)(async (req, res) => {
    const request = auth_schemas_1.registerSchema.parse({
        ...req.body,
        userAgent: req.headers["user-agent"],
    });
    const { user, accessToken, refreshToken } = await (0, auth_service_1.createAccount)(request);
    return (0, cookies_1.setAuthCookies)({ res, accessToken, refreshToken })
        .status(http_1.CREATED)
        .json(user);
});
exports.loginHandler = (0, catchErrors_1.default)(async (req, res) => {
    const request = auth_schemas_1.loginSchema.parse({
        ...req.body,
        userAgent: req.headers["user-agent"],
    });
    const { accessToken, refreshToken } = await (0, auth_service_1.loginUser)(request);
    // set cookies
    return (0, cookies_1.setAuthCookies)({ res, accessToken, refreshToken })
        .status(http_1.OK)
        .json({ message: "Login successful" });
});
exports.logoutHandler = (0, catchErrors_1.default)(async (req, res) => {
    const accessToken = req.cookies.accessToken;
    const { payload } = (0, jwt_1.verifyToken)(accessToken || "");
    if (payload) {
        // remove session from db
        await session_model_1.default.findByIdAndDelete(payload.sessionId);
    }
    // clear cookies
    return (0, cookies_1.clearAuthCookies)(res)
        .status(http_1.OK)
        .json({ message: "Logout successful" });
});
exports.refreshHandler = (0, catchErrors_1.default)(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    (0, appAssert_1.default)(refreshToken, http_1.UNAUTHORIZED, "Missing refresh token");
    const { accessToken, newRefreshToken } = await (0, auth_service_1.refreshUserAccessToken)(refreshToken);
    if (newRefreshToken) {
        res.cookie("refreshToken", newRefreshToken, (0, cookies_1.getRefreshTokenCookieOptions)());
    }
    return res
        .status(http_1.OK)
        .cookie("accessToken", accessToken, (0, cookies_1.getAccessTokenCookieOptions)())
        .json({ message: "Access token refreshed" });
});
exports.verifyEmailHandler = (0, catchErrors_1.default)(async (req, res) => {
    const verificationCode = auth_schemas_1.verificationCodeSchema.parse(req.params.code);
    await (0, auth_service_1.verifyEmail)(verificationCode);
    return res.status(http_1.OK).json({ message: "Email was successfully verified" });
});
exports.sendPasswordResetHandler = (0, catchErrors_1.default)(async (req, res) => {
    const email = auth_schemas_1.emailSchema.parse(req.body.email);
    await (0, auth_service_1.sendPasswordResetEmail)(email);
    return res.status(http_1.OK).json({ message: "Password reset email sent" });
});
exports.resetPasswordHandler = (0, catchErrors_1.default)(async (req, res) => {
    const request = auth_schemas_1.resetPasswordSchema.parse(req.body);
    await (0, auth_service_1.resetPassword)(request);
    return (0, cookies_1.clearAuthCookies)(res)
        .status(http_1.OK)
        .json({ message: "Password was reset successfully" });
});
