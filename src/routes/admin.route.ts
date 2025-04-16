import { Router } from 'express';
import { deleteAdmin, getAllAdmins, getAdminHandler, updateAdmin, getAdminStats } from '../controller/admin.controller';
import { uploadMiddleware } from '../middleware/uploadMiddleware';
import { getAllUsers } from '../controller/user.controller';

const router = Router();

router.get('/users', getAllUsers)
router.get('/get-stats', getAdminStats)
router.get('/', getAdminHandler)
router.get('/all', getAllAdmins)
router.delete('/:id', deleteAdmin);
router.put('/update', uploadMiddleware , updateAdmin)

export default router;