import express from 'express';
import { startPayment, createPayment, getPayment, notifyUsersForPayment, isQuizPaidFor } from '../controller/payment.controller';

const router = express.Router();


router.get('/quiz-paid/:quizId', isQuizPaidFor)
router.put('/notify-users/:quizId', notifyUsersForPayment)
router.post('/start/:quizId', startPayment);
router.get('/verify', createPayment);
router.get('/receipt', getPayment);

export default router;
