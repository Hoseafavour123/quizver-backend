import { Request, Response, NextFunction } from 'express';
import { UNAUTHORIZED } from '../constants/http';
import appAssert  from '../utils/appAssert';
import AppErrorCodes from '../constants/appErrorCodes';
import jwt from 'jsonwebtoken';

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const accessToken = req.cookies.accessToken
  appAssert(
    accessToken,
    UNAUTHORIZED,
    'Unauthorized',
    AppErrorCodes.InvalidAccessToken
  )

  try {
    const secret = process.env.JWT_TOKEN_SECRET as string
    const payload = jwt.verify(accessToken, secret) as jwt.JwtPayload

    appAssert(
      payload,
      UNAUTHORIZED,
      'Invalid token',
      AppErrorCodes.InvalidAccessToken
    )

    req.userId = payload.userId
    req.sessionId = payload.sessionId
    next()
  } catch (error: any) {
    console.error('Token verification error:', error)
    appAssert(
      false,
      UNAUTHORIZED,
      error.message === 'jwt expired' ? 'Token expired' : 'Invalid token',
      AppErrorCodes.InvalidAccessToken
    )
  }
}
