import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
} from '../constants/http'
import VerificationCodeTypes from '../constants/verificationcodetypes'
import SessionModel from '../models/session.model'
import AdminModel from '../models/admin.model'
import VerificationCodeModel from '../models/verificationCode.model'
import appAssert from '../utils/appAssert'
import { RefreshTokenPayload, refreshTokenSignOptions, signToken, verifyToken } from '../utils/jwt'
import {
  fiveMinutesAgo,
  ONE_DAY_MS,
  oneHourFromNow,
  thirtyDaysFromNow,
} from '../utils/date'
import { sendMail } from '../utils/sendMail'
import {
  getPasswordResetTemplate,
  getVerifyEmailTemplate,
} from '../utils/emailTtemplates'
import { hashValue } from '../utils/bcrypt'

export type CreateAccountParams = {
  email: string
  password: string
  name: string
  userAgent?: string
}

export const createAccount = async (data: CreateAccountParams) => {
  const existingAdmin = await AdminModel.exists({ email: data.email })

  appAssert(!existingAdmin, CONFLICT, 'User with this email already exists')

  const admin = await AdminModel.create({
    name: data.name,
    email: data.email,
    password: data.password,
  })

  const userId = admin._id

  const verificationCode = await VerificationCodeModel.create({
    userId,
    type: VerificationCodeTypes.EmailVerification,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
  })

  const url = `${process.env.APP_ORIGIN}/admin/email/verify/${verificationCode._id}`

  await sendMail({ email: admin.email, ...getVerifyEmailTemplate(url) })
    .then((res) => console.log('Verification email sent'))
    .catch((err) =>
      appAssert(
        !err,
        INTERNAL_SERVER_ERROR,
        'Failed to send verification email'
      )
    )

  const session = await SessionModel.create({
    userId,
    userAgent: data.userAgent,
  })

  const refreshToken = signToken(
    {
      sessionId: session._id,
    },
    refreshTokenSignOptions
  )
  const accessToken = signToken({
    userId,
    sessionId: session._id,
  })
  return {
    admin: admin.omitPassword(),
    accessToken,
    refreshToken,
  }
}

export type LoginParams = {
  email: string
  password: string
  userAgent?: string
}

export const loginUser = async ({
  email,
  password,
  userAgent,
}: LoginParams) => {
  const admin = await AdminModel.findOne({ email })
  appAssert(admin, UNAUTHORIZED, 'Invalid email or password')

  const isValid = await admin.comparePassword(password)
  appAssert(isValid, UNAUTHORIZED, 'Invalid email or password')

  const userId = admin._id

  const session = await SessionModel.create({
    userId,
    userAgent,
  })

  const sessionInfo = {
    sessionId: session._id,
  }

  const refreshToken = signToken(sessionInfo, refreshTokenSignOptions)
  const accessToken = signToken({
    ...sessionInfo,
    userId,
  })
  return {
    user: admin.omitPassword(),
    accessToken,
    refreshToken,
  }

 
}

export const refreshUserAccessToken = async (refreshToken: string) => {
  const { payload } = verifyToken<RefreshTokenPayload>(refreshToken, {
    secret: refreshTokenSignOptions.secret,
  })
  appAssert(payload, UNAUTHORIZED, 'Invalid refresh token')

  const session = await SessionModel.findById(payload.sessionId)
  const now = Date.now()
  appAssert(
    session && session.expiresAt.getTime() > now,
    UNAUTHORIZED,
    'Session expired'
  )

  // refresh the session if it expires in the next 24hrs
  const sessionNeedsRefresh = session.expiresAt.getTime() - now <= ONE_DAY_MS
  if (sessionNeedsRefresh) {
    session.expiresAt = thirtyDaysFromNow()
    await session.save()
  }

  const newRefreshToken = sessionNeedsRefresh
    ? signToken(
        {
          sessionId: session._id,
        },
        refreshTokenSignOptions
      )
    : undefined

  const accessToken = signToken({
    userId: session.userId,
    sessionId: session._id,
  })

  return {
    accessToken,
    newRefreshToken,
  }
}

export const verifyEmail = async (code: string) => {
  const verificationCode = await VerificationCodeModel.findOne({
    _id: code,
    type: VerificationCodeTypes.EmailVerification,
    expiresAt: { $gt: new Date() },
  })

  appAssert(
    verificationCode,
    UNAUTHORIZED,
    'Invalid or expired verification code'
  )

  const updatedAdmin = await AdminModel.findByIdAndUpdate(
    verificationCode.userId,
    { verified: true },
    { new: true }
  )

  appAssert(updatedAdmin, INTERNAL_SERVER_ERROR, 'Failed to verify email')
  await verificationCode.deleteOne()

  return {
    admin: updatedAdmin.omitPassword(),
  }
}

export const sendPasswordResetEmail = async (email: string) => {
  const admin = await AdminModel.findOne({ email })
  appAssert(admin, NOT_FOUND, 'User does not exist')

  const fiveMinsAgo = fiveMinutesAgo()

  const count = await VerificationCodeModel.countDocuments({
    userId: admin._id,
    type: VerificationCodeTypes.PasswordReset,
    createdAt: { $gt: fiveMinsAgo },
  })

  appAssert(
    count <= 1,
    TOO_MANY_REQUESTS,
    'Too many requests, try again in 5 minutes'
  )

  const expiresAt = oneHourFromNow()

  const verificationCode = await VerificationCodeModel.create({
    userId: admin._id,
    type: VerificationCodeTypes.PasswordReset,
    expiresAt,
  })

  const url = `${process.env.APP_ORIGIN}/password/reset?code=${
    verificationCode._id
  }&exp=${expiresAt.getTime()}`

  await sendMail({ email, ...getPasswordResetTemplate(url) })
    .then((res) => console.log('Password reset email sent'))
    .catch((err) =>
      appAssert(
        !err,
        INTERNAL_SERVER_ERROR,
        'Failed to send password reset email'
      )
    )

  return { url }
}

export const resetPassword = async (code: string, password: string) => {
  const verificationCode = await VerificationCodeModel.findOne({
    _id: code,
    type: VerificationCodeTypes.PasswordReset,
    expiresAt: { $gt: new Date() },
  })

  appAssert(
    verificationCode,
    UNAUTHORIZED,
    'Invalid or expired verification code'
  )

  const updatedAdmin = await AdminModel.findByIdAndUpdate(
    verificationCode.userId,
    { password: await hashValue(password) }
  )

  appAssert(updatedAdmin, INTERNAL_SERVER_ERROR, 'Failed to reset password')

  await verificationCode.deleteOne()

  await SessionModel.deleteMany({ userId: updatedAdmin._id })

  return {
    admin: updatedAdmin.omitPassword(),
  }
}
