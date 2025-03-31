"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("../controller/payment.controller");
const router = express_1.default.Router();
router.get('/quiz-paid/:quizId', payment_controller_1.isQuizPaidFor);
router.put('/notify-users/:quizId', payment_controller_1.notifyUsersForPayment);
router.post('/start/:quizId', payment_controller_1.startPayment);
router.get('/verify', payment_controller_1.createPayment);
router.get('/receipt', payment_controller_1.getPayment);
exports.default = router;
