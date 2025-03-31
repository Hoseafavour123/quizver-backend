import { Router } from 'express'
import { registerHandler, loginHandler, logoutHandler, refreshHandler, verifyEmailHandler, sendPasswordResetHandler, resetPasswordHandler } from '../controller/authUser.controller'

const router = Router()

router.post('/register', registerHandler)
router.post('/login', loginHandler)
router.get('/logout', logoutHandler)
router.get('/refresh', refreshHandler)
router.get('/email/verify/:code', verifyEmailHandler)
router.post('/password/forgot', sendPasswordResetHandler)
router.post('/password/reset', resetPasswordHandler)


export default router