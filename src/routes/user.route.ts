import { Router } from 'express';
import { deleteUser, updateUser, getAllUsers, getUserHandler, getStats } from '../controller/user.controller';
import { uploadMiddleware } from '../middleware/uploadMiddleware';


const router = Router();

router.get('/get-stats', getStats)
router.get('/', getUserHandler)
router.get('/all', getAllUsers)
router.delete('/:id', deleteUser);
router.put('/update', uploadMiddleware, updateUser);

export default router;