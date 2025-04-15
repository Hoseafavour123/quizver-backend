import { Router } from 'express';
import { deleteUser, updateUser, getAllUsers, getUserHandler, getStats } from '../controller/user.controller';
import { uploadMiddleware } from '../middleware/uploadMiddleware';
import { getPaymentProfile, savePaymentprofile } from '../controller/payment.controller';

const router = Router();

router.post('/payment-profile', savePaymentprofile)
router.get('/payment-profile', getPaymentProfile)
router.get('/get-stats', getStats)
router.get('/', getUserHandler)
router.get('/all', getAllUsers)
router.delete('/:id', deleteUser);
router.put('/update', uploadMiddleware, updateUser);

export default router;