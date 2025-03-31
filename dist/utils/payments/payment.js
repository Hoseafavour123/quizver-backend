"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.initializePayment = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_TEST_SECRET_KEY;
const initializePayment = async (form) => {
    try {
        const response = await axios_1.default.post('https://api.paystack.co/transaction/initialize', form, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }
    catch (error) {
        throw new Error(`Payment Initialization Failed: ${error.response?.data?.message || error.message}`);
    }
};
exports.initializePayment = initializePayment;
const verifyPayment = async (reference) => {
    try {
        const response = await axios_1.default.get(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }
    catch (error) {
        throw new Error(`Payment Verification Failed: ${error.response?.data?.message || error.message}`);
    }
};
exports.verifyPayment = verifyPayment;
