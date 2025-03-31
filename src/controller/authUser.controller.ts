import { CREATED, OK, UNAUTHORIZED } from '../constants/http'
import {
  createAccount,
  loginUser,
  refreshUserAccessToken,
  resetPassword,
  sendPasswordResetEmail,
  verifyEmail,
} from '../services/authUser.service'
import catchErrors from '../utils/catchErrors'
import { z } from 'zod'
import {
  clearAuthCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthCookies,
} from '../utils/cookies'
import { loginSchema, registerSchema } from './authUser.schemas'
import SessionModel from '../models/session.model'
import { verifyToken } from '../utils/jwt'
import appAssert from '../utils/appAssert'




export const registerHandler = catchErrors(async (req, res) => {
  const request = registerSchema.parse({
    ...req.body,
    userAgent: req.headers['user-agent'],
  })

  const { user, accessToken, refreshToken } = await createAccount(request)

  return setAuthCookies({ res, accessToken, refreshToken })
    .status(CREATED)
    .json(user)
})



export const loginHandler = catchErrors(async (req, res) => {
  const request = loginSchema.parse({
    ...req.body,
    userAgent: req.headers['user-agent'],
  })

  const { accessToken, refreshToken } = await loginUser(request)

  return setAuthCookies({ res, accessToken, refreshToken })
    .status(OK)
    .json({ message: 'login successfull' })
})




export const logoutHandler = catchErrors(async (req, res) => {
  const accessToken = req.cookies.accessToken
  const { payload } = verifyToken(accessToken)
  if (payload) {
    await SessionModel.findByIdAndDelete(payload.sessionId)
  }
  return clearAuthCookies(res)
    .status(OK)
    .json({ message: 'logout successfull' })
})

export const refreshHandler = catchErrors(async (req, res) => {
  const refreshToken = (req.cookies.refreshToken as string) || undefined
  appAssert(refreshToken, UNAUTHORIZED, 'No refresh token provided')

  const { accessToken, newRefreshToken } = await refreshUserAccessToken(
    refreshToken
  )

  if (refreshToken) {
    res.cookie('refreshToken', newRefreshToken, getRefreshTokenCookieOptions())
  }
  return res
    .status(OK)
    .cookie('accessToken', accessToken, getAccessTokenCookieOptions())
    .json({ message: 'refresh successfull' })
})

export const verifyEmailHandler = catchErrors(async (req, res) => {
  console.log(req.params.code)
  const { code } = z
    .object({
      code: z.string(),
    })
    .parse(req.params)

  await verifyEmail(code)

  return res.status(OK).json({ message: 'Email was successfully verified' })
})

export const sendPasswordResetHandler = catchErrors(async (req, res) => {
  const { email } = z
    .object({
      email: z.string().email(),
    })
    .parse(req.body)

  await sendPasswordResetEmail(email)

  return res.status(OK).json({ message: 'Password reset email sent' })
})

export const resetPasswordHandler = catchErrors(async (req, res) => {
  const { code } = z
    .object({
      code: z.string(),
    })
    .parse(req.body)

  const { password } = z
    .object({
      password: z.string(),
    })
    .parse(req.body)

  await resetPassword(code, password)

  await clearAuthCookies(res)
    .status(OK)
    .json({ message: 'Password was successfully reset' })
})
