import { Router } from 'express';
import { deleteAdmin, getAllAdmin, getAdminHandler, updateAdmin, getAdminStats } from '../controller/admin.controller';
import { uploadMiddleware } from '../middleware/uploadMiddleware';

const router = Router();

router.get('/get-stats', getAdminStats)
router.get('/', getAdminHandler)
router.get('/all', getAllAdmin)
router.delete('/:id', deleteAdmin);
router.put('/update', uploadMiddleware , updateAdmin)

export default router;