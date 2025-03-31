export const OK = 200
export const CREATED = 201
export const ACCEPTED = 202
export const NO_CONTENT = 204
export const BAD_REQUEST = 400
export const UNAUTHORIZED = 401
export const FORBIDDEN = 403
export const NOT_FOUND = 404
export const METHOD_NOT_ALLOWED = 405
export const CONFLICT = 409
export const UNPROCESSABLE_ENTITY = 422
export const TOO_MANY_REQUESTS = 429
export const INTERNAL_SERVER_ERROR = 500
export const NOT_IMPLEMENTED = 501
export const BAD_GATEWAY = 502
export const SERVICE_UNAVAILABLE = 503
export const GATEWAY_TIMEOUT = 504

export type httpStatusCodes =
  | typeof OK
  | typeof CREATED
  | typeof ACCEPTED
  | typeof NO_CONTENT
  | typeof BAD_REQUEST
  | typeof UNAUTHORIZED
  | typeof FORBIDDEN
  | typeof NOT_FOUND
  | typeof METHOD_NOT_ALLOWED
  | typeof CONFLICT
  | typeof UNPROCESSABLE_ENTITY
  | typeof TOO_MANY_REQUESTS
  | typeof INTERNAL_SERVER_ERROR
  | typeof NOT_IMPLEMENTED
  | typeof BAD_GATEWAY
  | typeof SERVICE_UNAVAILABLE
  | typeof GATEWAY_TIMEOUT
