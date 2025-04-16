import { Router } from "express";
import { getNotifications, markAsRead } from "../controller/notfications.controller";

const router = Router()

router.put('/mark-as-read/:userId', markAsRead)
router.get('/:userId', getNotifications)

export default router