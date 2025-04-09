"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_REFRESH_SECRET = exports.JWT_SECRET = exports.APP_ORIGIN = exports.MONGO_URI = exports.PORT = exports.NODE_ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getEnv = (key, defaultValue) => {
    const value = process.env[key] || defaultValue;
    if (value === undefined) {
        throw Error(`Missing String environment variable for ${key}`);
    }
    return value;
};
exports.NODE_ENV = getEnv('NODE_ENV', 'development');
exports.PORT = getEnv('PORT', '4005');
exports.MONGO_URI = getEnv('MONGO_URI', process.env.MONGO_URI);
exports.APP_ORIGIN = getEnv('APP_ORIGIN', process.env.APP_ORIGIN);
exports.JWT_SECRET = getEnv('JWT_SECRET', process.env.JWT_SECRET);
exports.JWT_REFRESH_SECRET = getEnv('JWT_REFRESH_SECRET', process.env.JWT_REFRESH_SECRET);
