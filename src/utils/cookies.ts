import { CookieOptions, Response } from 'express'
import { oneHourFromNow, thirtyDaysFromNow } from './date'

export const REFRESH_PATH = '/auth/refresh'
const secure = process.env.NODE_ENV !== 'development'

const defaults: CookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure,
}

export const getAccessTokenCookieOptions = (): CookieOptions => {
  return {
    ...defaults,
    expires: oneHourFromNow(),
  }
}

export const getRefreshTokenCookieOptions = (): CookieOptions => {
  return {
    ...defaults,
    expires: thirtyDaysFromNow(),
    path: REFRESH_PATH,
  }
}

type Params = {
  res: Response
  accessToken: string
  refreshToken: string
}

export const setAuthCookies = ({ res, accessToken, refreshToken }: Params) => {
  return res
    .cookie('accessToken', accessToken, getAccessTokenCookieOptions())
    .cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions())
}

export const clearAuthCookies = (res: Response) => {
  return res.clearCookie('accessToken').clearCookie('refreshToken', {
    path: REFRESH_PATH,
  })
}