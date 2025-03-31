import AppErrorCodes from "../constants/appErrorCode"
import { httpStatusCodes } from "../constants/http"

class AppError extends Error {
    constructor(
        public statusCode: httpStatusCodes,
        public message: string,
        public errorCode?: AppErrorCodes
    ){
        super(message)
    }
}



export default AppError