import HttpStatus from 'http-status';
import {NextFunction, Request, Response} from "express";

export class AppError extends Error {
    status: number
    details?: object | object[]

    constructor(status: number, message: string, details?: object | object[]) {
        super(message)
        this.status = status
        this.details = details
        this.name = 'AppError'
        if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor)
    }

}

export function UnauthorizedException(detail?: object | object[]): never {
    throw new AppError(
        HttpStatus.UNAUTHORIZED,
        'Unauthorized. You must login to access this content.',
        detail
    )
}

export function ForbiddenException(detail?: object | object[]): never {
    throw new AppError(
        HttpStatus.FORBIDDEN,
        'Forbidden. You are not allowed to perform this action',
        detail
    )
}

export function ValidationException(errors: object | object[]): never {
    throw new AppError(
        HttpStatus.BAD_REQUEST,
        'Validation Error',
        errors
    )
}

export function ConflictException(detail: object | object[]): never {
    throw new AppError(
        HttpStatus.CONFLICT,
        'Conflict',
        detail
    )
}

export function NotFoundException(detail: object | object[]): never {
    throw new AppError(
        HttpStatus.NOT_FOUND,
        'Not Found',
        detail
    )
}

export function isAppError(err: unknown): err is AppError {
    return err instanceof AppError && typeof err.status === 'number'
}

export function ErrorHandling(error: Error, req: Request, res: Response, next: NextFunction) : Response {
    if (!error) {
        next()
        return res
    }

    else if (error instanceof AppError) {
        return res.status(error.status).json({
            message: error.message,
            code: error.status,
            errors: error.details
        })
    }

    else {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}