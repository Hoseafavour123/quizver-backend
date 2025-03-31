"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const http_1 = require("../constants/http");
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = (req, res, next) => {
    // Allow Paystack to call `/payments/verify` without authentication
    if (req.path === '/payment/verify') {
        return next();
    }
    const accessToken = req.cookies.accessToken;
    (0, appAssert_1.default)(accessToken, http_1.UNAUTHORIZED, 'Unauthorized', "InvalidAccessToken" /* AppErrorCodes.InvalidAccessToken */);
    try {
        const secret = process.env.JWT_TOKEN_SECRET;
        const payload = jsonwebtoken_1.default.verify(accessToken, secret);
        (0, appAssert_1.default)(payload, http_1.UNAUTHORIZED, 'Invalid token', "InvalidAccessToken" /* AppErrorCodes.InvalidAccessToken */);
        req.userId = payload.userId;
        req.sessionId = payload.sessionId;
        next();
    }
    catch (error) {
        console.error('Token verification error:', error);
        (0, appAssert_1.default)(false, http_1.UNAUTHORIZED, error.message === 'jwt expired' ? 'Token expired' : 'Invalid token', "InvalidAccessToken" /* AppErrorCodes.InvalidAccessToken */);
    }
};
exports.authenticate = authenticate;
