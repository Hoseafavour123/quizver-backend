import express from 'express';
import { startPayment, createPayment, getPayment, notifyUsersForPayment, isQuizPaidFor, getBanks, createTransferRecipient, initiateTransfer, verifyTransfer, sendPaymentNotification } from '../controller/payment.controller';

const router = express.Router();


router.get('/send-payment-notification', sendPaymentNotification)
router.get('/banks', getBanks)
router.post('/create-recipient', createTransferRecipient)
router.post('/initiate-transfer', initiateTransfer)
router.post('/verify-transfer', verifyTransfer)
router.get('/quiz-paid/:quizId', isQuizPaidFor)
router.put('/notify-users/:quizId', notifyUsersForPayment)
router.post('/start/:quizId', startPayment);
router.get('/verify', createPayment);
router.get('/receipt', getPayment);

export default router;