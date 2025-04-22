import { CookieOptions, Response } from 'express'
import { fifteenMinutesFromNow, thirtyDaysFromNow } from './date'

export const REFRESH_PATH = '/auth/refresh'

const defaults: CookieOptions = {
  sameSite: 'none',
  httpOnly: true,
  secure: true,
}

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: fifteenMinutesFromNow(),
})

// export const getRefreshTokenCookieOptions = (): CookieOptions => ({
//   ...defaults,
//   expires: thirtyDaysFromNow(),
//   path: REFRESH_PATH,
// })


export const getRefreshTokenCookieOptions = (
  path: string = REFRESH_PATH
): CookieOptions => ({
  ...defaults,
  expires: thirtyDaysFromNow(),
  path,
})


type Params = {
  res: Response
  accessToken: string
  refreshToken: string
  refreshPath?: string
}

export const setAuthCookies = ({
  res,
  accessToken,
  refreshToken,
  refreshPath = REFRESH_PATH,
}: Params) =>
  res
    .cookie('accessToken', accessToken, getAccessTokenCookieOptions())
    .cookie(
      'refreshToken',
      refreshToken,
      getRefreshTokenCookieOptions(refreshPath)
    )

// export const setAuthCookies = ({ res, accessToken, refreshToken }: Params) =>
//   res
//     .cookie('accessToken', accessToken, getAccessTokenCookieOptions())
//     .cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions())

export const clearAuthCookies = (res: Response, refreshPath: string) =>
  res
    .clearCookie('accessToken')
    .clearCookie('refreshToken', { path: refreshPath })
