import assert from "node:assert"
import AppError from "./AppError"
import { httpStatusCodes } from "../constants/http"
import AppErrorCodes from "../constants/appErrorCode"


type AppAssert = (
    condition: any,
    httpStatusCode: httpStatusCodes,
    message: string,
    appErrorCode?: AppErrorCodes
) => asserts condition;

const appAssert: AppAssert = (
    condition,
    httpStatusCode,
    message,
    appErrorCode
) => assert(condition, new AppError(httpStatusCode, message, appErrorCode))

export default appAssert