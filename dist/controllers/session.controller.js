"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSessionHandler = exports.getSessionsHandler = void 0;
const zod_1 = require("zod");
const http_1 = require("../constants/http");
const session_model_1 = __importDefault(require("../models/session.model"));
const catchErrors_1 = __importDefault(require("../utils/catchErrors"));
const appAssert_1 = __importDefault(require("../utils/appAssert"));
exports.getSessionsHandler = (0, catchErrors_1.default)(async (req, res) => {
    const sessions = await session_model_1.default.find({
        userId: req.userId,
        expiresAt: { $gt: Date.now() },
    }, {
        _id: 1,
        userAgent: 1,
        createdAt: 1,
    }, {
        sort: { createdAt: -1 },
    });
    return res.status(http_1.OK).json(
    // mark the current session
    sessions.map((session) => ({
        ...session.toObject(),
        ...(session.id === req.sessionId && {
            isCurrent: true,
        }),
    })));
});
exports.deleteSessionHandler = (0, catchErrors_1.default)(async (req, res) => {
    const sessionId = zod_1.z.string().parse(req.params.id);
    const deleted = await session_model_1.default.findOneAndDelete({
        _id: sessionId,
        userId: req.userId,
    });
    (0, appAssert_1.default)(deleted, http_1.NOT_FOUND, "Session not found");
    return res.status(http_1.OK).json({ message: "Session removed" });
});
