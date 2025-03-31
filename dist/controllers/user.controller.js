"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserHandler = void 0;
const http_1 = require("../constants/http");
const user_model_1 = __importDefault(require("../models/user.model"));
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const catchErrors_1 = __importDefault(require("../utils/catchErrors"));
exports.getUserHandler = (0, catchErrors_1.default)(async (req, res) => {
    const user = await user_model_1.default.findById(req.userId);
    (0, appAssert_1.default)(user, http_1.NOT_FOUND, "User not found");
    return res.status(http_1.OK).json(user.omitPassword());
});
