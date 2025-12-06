import { Request, Response, Router } from 'express';

// Router para las rutas de health
const healthRouter = Router();

// Endpoint GET para verificar la salud del servidor
healthRouter.get('/', (_req: Request, res: Response) => {
    return res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

export default healthRouter;