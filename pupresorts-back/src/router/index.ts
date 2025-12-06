import {Router} from "express";
import authRouter from "@src/domains/auth/auth.controller";
import userRouter from "@src/domains/user/user.controller";
import {paymentRouter} from "@src/domains/payment/payment.controller";
import {bookingRouter} from "@src/domains/booking/booking.controller";
import {dogRouter} from "@src/domains/dog/dog.controller";

export const router = Router()

router.use('/auth', authRouter )
router.use('/payments', paymentRouter)
router.use('/booking', bookingRouter)
router.use('/user', userRouter)
router.use('/dog', dogRouter)