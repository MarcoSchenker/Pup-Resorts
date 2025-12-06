import { PrismaClient } from "@prisma/client"
import {UserRepository} from "@src/domains/user/user.repository";
import {AuthService} from "@src/domains/auth/auth.service";
import {Request, Response, Router} from "express";
import { body } from "express-validator";
import validate from "@src/utils/validation";

const prisma = new PrismaClient()
const userRepository = new UserRepository(prisma)
const authService = new AuthService(userRepository)

const authRouter = Router()

const registerValidations = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('name').notEmpty().withMessage('Name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
]

const loginValidations = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
]

authRouter.post('/register', validate(registerValidations), async (req: Request, res: Response) => {
    const { name, lastName, email, password } = req.body
    const result = await authService.signUp({ name, lastName, email, password })
    return res.status(201).json(result)
})

authRouter.post('/login', validate(loginValidations), async (req: Request, res: Response) => {
    const { email, password } = req.body
    const token = await authService.login({ email, password })
    return res.status(200).json({ token })
})

export default authRouter;