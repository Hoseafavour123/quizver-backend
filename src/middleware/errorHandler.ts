import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { z } from 'zod';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from '../constants/http';
import AppError from '../utils/AppError';
import { clearAuthCookies, REFRESH_PATH } from '../utils/cookies';

const handleZodError = (res: Response, err: z.ZodError) => {
    const errors = err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
    }));

    return res.status(BAD_REQUEST).json({
        message: 'Validation error',
        errors
    });
};


const handleAppError = (res: Response, err: AppError) => {
    return res.status(err.statusCode).json({
        message: err.message,
        errorCode: err.errorCode
    });
};

const errorHandler: ErrorRequestHandler = (err, req: Request, res: Response, next: NextFunction): void => {
    console.log(`PATH ${req.path}`, err);

    if (req.path === REFRESH_PATH) {
        clearAuthCookies(res)
    }
    if (err instanceof z.ZodError) {
        handleZodError(res, err);
        return
    }

    if (err instanceof AppError) {
         handleAppError(res, err)
        return
    }

    res.status(INTERNAL_SERVER_ERROR).send('Internal server error');
};

export default errorHandler;