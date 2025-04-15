import express from 'express';
import { startPayment, createPayment, getPayment, notifyUsersForPayment, isQuizPaidFor, getBanks, createTransferRecipient, initiateTransfer, verifyTransfer } from '../controller/payment.controller';

const router = express.Router();

router.get('/banks', getBanks)
router.post('/create-transfer-recipient', createTransferRecipient)
router.post('/initiate-transfer', initiateTransfer)
router.post('/verify-transfer', verifyTransfer)
router.get('/quiz-paid/:quizId', isQuizPaidFor)
router.put('/notify-users/:quizId', notifyUsersForPayment)
router.post('/start/:quizId', startPayment);
router.get('/verify', createPayment);
router.get('/receipt', getPayment);

export default router;