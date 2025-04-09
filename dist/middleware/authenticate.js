"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const http_1 = require("../constants/http");
const jwt_1 = require("../utils/jwt");
// wrap with catchErrors() if you need this to be async
const authenticate = (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    (0, appAssert_1.default)(accessToken, http_1.UNAUTHORIZED, 'Not authorized', "InvalidAccessToken" /* AppErrorCode.InvalidAccessToken */);
    const { error, payload } = (0, jwt_1.verifyToken)(accessToken);
    (0, appAssert_1.default)(payload, http_1.UNAUTHORIZED, error === 'jwt expired' ? 'Token expired' : 'Invalid token', "InvalidAccessToken" /* AppErrorCode.InvalidAccessToken */);
    req.userId = payload.userId;
    req.sessionId = payload.sessionId;
    next();
};
exports.default = authenticate;
