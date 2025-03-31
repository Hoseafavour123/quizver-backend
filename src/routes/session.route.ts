import { Router } from "express";
import { getSessionsHandler, deleteSessionHandler } from "../controller/sessions.controller";

const router = Router()

router.get('/', getSessionsHandler)
router.delete('/:id', deleteSessionHandler)

export default router