"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.refreshTokenSignOptions = exports.accessTokenSignOptions = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const defaults = {
    audience: ['user'],
};
exports.accessTokenSignOptions = {
    expiresIn: '30min',
    secret: process.env.JWT_TOKEN_SECRET,
};
exports.refreshTokenSignOptions = {
    expiresIn: '30d',
    secret: process.env.JWT_TOKEN_SECRET,
};
const verifyToken = (token, options) => {
    const { secret = process.env.JWT_TOKEN_SECRET, ...verifyOpts } = options || {};
    try {
        const payload = jsonwebtoken_1.default.verify(token, secret, { ...defaults, ...verifyOpts });
        return { payload };
    }
    catch (error) {
        return {
            error: error.message
        };
    }
};
exports.verifyToken = verifyToken;
