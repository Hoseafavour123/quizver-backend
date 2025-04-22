"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const http_1 = require("../constants/http");
const AppError_1 = __importDefault(require("../utils/AppError"));
const cookies_1 = require("../utils/cookies");
const handleZodError = (res, err) => {
    const errors = err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
    }));
    return res.status(http_1.BAD_REQUEST).json({
        message: 'Validation error',
        errors
    });
};
const handleAppError = (res, err) => {
    return res.status(err.statusCode).json({
        message: err.message,
        errorCode: err.errorCode
    });
};
const errorHandler = (err, req, res, next) => {
    console.log(`PATH ${req.path}`, err);
    if (req.path === cookies_1.REFRESH_PATH) {
        (0, cookies_1.clearAuthCookies)(res, cookies_1.REFRESH_PATH);
    }
    if (err instanceof zod_1.z.ZodError) {
        handleZodError(res, err);
        return;
    }
    if (err instanceof AppError_1.default) {
        handleAppError(res, err);
        return;
    }
    res.status(http_1.INTERNAL_SERVER_ERROR).send('Internal server error');
};
exports.default = errorHandler;
