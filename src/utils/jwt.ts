import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken'
import { SessionDocument } from '../models/session.model'

export type AccessTokenPayload = {
  userId: string
  sessionId: string
}

export type RefreshTokenPayload = {
  sessionId: SessionDocument['_id']
}
type SignOptionsAndSecret = SignOptions & {
  secret: string
}

const defaults: SignOptions = {
  audience: ['user'],
}

export const accessTokenSignOptions: SignOptionsAndSecret = {
  expiresIn: '30min',
  secret: process.env.JWT_TOKEN_SECRET as string,
}

export const refreshTokenSignOptions: SignOptionsAndSecret = {
  expiresIn: '30d',
  secret: process.env.JWT_TOKEN_SECRET as string,
}

export const verifyToken = <TPayload extends object = AccessTokenPayload> (
  token: string,
  options?: VerifyOptions & { secret: string }
) => {
  const { secret = process.env.JWT_TOKEN_SECRET as string, ...verifyOpts } =
    options || {}
  try {
    const payload = jwt.verify(token, secret, { ...defaults, ...verifyOpts }) as TPayload
    return { payload }
  } catch (error:any) {
    return {
      error: error.message
    }
  }

}
