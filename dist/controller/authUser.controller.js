"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordHandler = exports.sendPasswordResetHandler = exports.verifyEmailHandler = exports.refreshHandler = exports.logoutHandler = exports.loginHandler = exports.registerHandler = void 0;
const http_1 = require("../constants/http");
const authUser_service_1 = require("../services/authUser.service");
const catchErrors_1 = __importDefault(require("../utils/catchErrors"));
const zod_1 = require("zod");
const cookies_1 = require("../utils/cookies");
const authUser_schemas_1 = require("./authUser.schemas");
const session_model_1 = __importDefault(require("../models/session.model"));
const jwt_1 = require("../utils/jwt");
const appAssert_1 = __importDefault(require("../utils/appAssert"));
exports.registerHandler = (0, catchErrors_1.default)(async (req, res) => {
    const request = authUser_schemas_1.registerSchema.parse({
        ...req.body,
        userAgent: req.headers['user-agent'],
    });
    const { user, accessToken, refreshToken } = await (0, authUser_service_1.createAccount)(request);
    return (0, cookies_1.setAuthCookies)({ res, accessToken, refreshToken })
        .status(http_1.CREATED)
        .json(user);
});
exports.loginHandler = (0, catchErrors_1.default)(async (req, res) => {
    const request = authUser_schemas_1.loginSchema.parse({
        ...req.body,
        userAgent: req.headers['user-agent'],
    });
    const { accessToken, refreshToken } = await (0, authUser_service_1.loginUser)(request);
    return (0, cookies_1.setAuthCookies)({ res, accessToken, refreshToken })
        .status(http_1.OK)
        .json({ message: 'login successfull' });
});
exports.logoutHandler = (0, catchErrors_1.default)(async (req, res) => {
    const accessToken = req.cookies.accessToken;
    const { payload } = (0, jwt_1.verifyToken)(accessToken);
    if (payload) {
        await session_model_1.default.findByIdAndDelete(payload.sessionId);
    }
    return (0, cookies_1.clearAuthCookies)(res)
        .status(http_1.OK)
        .json({ message: 'logout successfull' });
});
exports.refreshHandler = (0, catchErrors_1.default)(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || undefined;
    (0, appAssert_1.default)(refreshToken, http_1.UNAUTHORIZED, 'No refresh token provided');
    const { accessToken, newRefreshToken } = await (0, authUser_service_1.refreshUserAccessToken)(refreshToken);
    if (refreshToken) {
        res.cookie('refreshToken', newRefreshToken, (0, cookies_1.getRefreshTokenCookieOptions)());
    }
    return res
        .status(http_1.OK)
        .cookie('accessToken', accessToken, (0, cookies_1.getAccessTokenCookieOptions)())
        .json({ message: 'refresh successfull' });
});
exports.verifyEmailHandler = (0, catchErrors_1.default)(async (req, res) => {
    console.log(req.params.code);
    const { code } = zod_1.z
        .object({
        code: zod_1.z.string(),
    })
        .parse(req.params);
    await (0, authUser_service_1.verifyEmail)(code);
    return res.status(http_1.OK).json({ message: 'Email was successfully verified' });
});
exports.sendPasswordResetHandler = (0, catchErrors_1.default)(async (req, res) => {
    const { email } = zod_1.z
        .object({
        email: zod_1.z.string().email(),
    })
        .parse(req.body);
    await (0, authUser_service_1.sendPasswordResetEmail)(email);
    return res.status(http_1.OK).json({ message: 'Password reset email sent' });
});
exports.resetPasswordHandler = (0, catchErrors_1.default)(async (req, res) => {
    const { code } = zod_1.z
        .object({
        code: zod_1.z.string(),
    })
        .parse(req.body);
    const { password } = zod_1.z
        .object({
        password: zod_1.z.string(),
    })
        .parse(req.body);
    await (0, authUser_service_1.resetPassword)(code, password);
    await (0, cookies_1.clearAuthCookies)(res)
        .status(http_1.OK)
        .json({ message: 'Password was successfully reset' });
});
