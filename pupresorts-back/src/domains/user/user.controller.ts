import {Request, Response, Router} from "express";
import {UserService} from "@src/domains/user/user.service";
import { PrismaClient } from "@prisma/client";
import {UserRepository} from "@src/domains/user/user.repository";
import {withAuth} from "@src/domains/auth/utils/auth";

const prismaClient = new PrismaClient();
const userRepository = new UserRepository(prismaClient);
const userService = new UserService(userRepository)

const userRouter : Router = Router();

userRouter.get('/me', withAuth, async (req: Request, res: Response) => {
    const userId = res.locals.context.id;
    const result = await userService.getUserById(userId)
    return res.status(200).json(result)
})

userRouter.put("/edit/:id", withAuth, async (req: Request, res: Response) => {
    try {
        const authUserId: string = res.locals.context.id;
        const { id: targetUserId } = req.params;
        const payload = req.body;

        const result = await userService.editUser(authUserId, targetUserId, payload);
        return res.status(200).json(result);
    } catch (err: any) {
        const status = err?.statusCode ?? 500;
        return res.status(status).json({ message: err?.message ?? "Internal Server Error" });
    }
});

export default userRouter;