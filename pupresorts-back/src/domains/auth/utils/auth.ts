import jwt, { JwtPayload } from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { Request, Response, NextFunction } from 'express'
import { UnauthorizedException } from '@src/utils/errors'

const JWT_SECRET: string = process.env.JWT_SECRET || 'default-development-secret'

export function generateAccessToken(payload: Record<string, string>): string{
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' })
}

export function withAuth(request: Request, response: Response, next: NextFunction): void {
    const authHeader = request.headers.authorization?.trim();
    const token = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : authHeader;

    if(!token){
        UnauthorizedException({message: 'Missing token'})
    }

    try{
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
        response.locals.context = decoded
        return next()
    } catch{
        UnauthorizedException({message: 'Invalid token'})
    }
}

export async function encryptPassword(password: string): Promise<string>{
    return await bcrypt.hash(password, 10)
}

export async function checkPassword(password: string, hash: string): Promise<boolean>{
    return await bcrypt.compare(password, hash)
}