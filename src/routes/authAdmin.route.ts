import { Router } from 'express'
import { registerHandler, loginHandler, logoutHandler, refreshHandler, verifyEmailHandler, sendPasswordResetHandler, resetPasswordHandler } from '../controller/authAdmin.controller'

const authAdminRoutes = Router()

authAdminRoutes.post('/register', registerHandler)
authAdminRoutes.post('/login', loginHandler)
authAdminRoutes.get('/logout', logoutHandler)
authAdminRoutes.get('/refresh', refreshHandler)
authAdminRoutes.get('/email/verify/:code', verifyEmailHandler)
authAdminRoutes.post('/password/forgot', sendPasswordResetHandler)
authAdminRoutes.post('/password/reset', resetPasswordHandler)

export default authAdminRoutes