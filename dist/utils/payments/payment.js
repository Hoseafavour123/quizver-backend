"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTransfer = exports.initiateTransfer = exports.createTransferRecipient = exports.verifyPayment = exports.initializePayment = exports.getBanks = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
//const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY as string
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_TEST_SECRET_KEY;
const getBanks = async () => {
    try {
        const response = await axios_1.default.get('https://api.paystack.co/bank', {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }
    catch (error) {
        throw new Error(`Bank Retrieval Failed: ${error.response?.data?.message || error.message}`);
    }
};
exports.getBanks = getBanks;
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
const createTransferRecipient = async ({ bankCode, accountNumber, email, fullName, metadata }) => {
    try {
        const response = await axios_1.default.post('https://api.paystack.co/transferrecipient', {
            type: 'nuban',
            name: fullName,
            account_number: accountNumber,
            bank_code: bankCode,
            currency: 'NGN', // You can set this to your preferred currency
            email,
            metadata: { userId: metadata?.userId }
        }, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }
    catch (error) {
        throw new Error(`Recipient Creation Failed: ${error.response?.data?.message || error.message}`);
    }
};
exports.createTransferRecipient = createTransferRecipient;
const initiateTransfer = async ({ amount, recipientCode, email }) => {
    try {
        const response = await axios_1.default.post('https://api.paystack.co/transfer', {
            amount: amount * 100, // Amount in kobo (smallest unit)
            recipient: recipientCode,
            email,
            currency: 'NGN',
        }, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }
    catch (error) {
        throw new Error(`Transfer Initiation Failed: ${error.response?.data?.message || error.message}`);
    }
};
exports.initiateTransfer = initiateTransfer;
const verifyTransfer = async (transferCode) => {
    try {
        const response = await axios_1.default.get(`https://api.paystack.co/transfer/${encodeURIComponent(transferCode)}`, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }
    catch (error) {
        throw new Error(`Transfer Verification Failed: ${error.response?.data?.message || error.message}`);
    }
};
exports.verifyTransfer = verifyTransfer;
