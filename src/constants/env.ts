import dotenv from 'dotenv'

dotenv.config()


const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue

  if (value === undefined) {
    throw Error(`Missing String environment variable for ${key}`)
  }

  return value
}

export const NODE_ENV = getEnv('NODE_ENV', 'development')
export const PORT = getEnv('PORT', '4005')
export const MONGO_URI = getEnv('MONGO_URI', process.env.MONGO_URI as string)
export const APP_ORIGIN = getEnv('APP_ORIGIN', process.env.APP_ORIGIN as string)
export const JWT_SECRET = getEnv('JWT_SECRET', process.env.JWT_SECRET as string)
export const JWT_REFRESH_SECRET = getEnv('JWT_REFRESH_SECRET', process.env.JWT_REFRESH_SECRET as string)