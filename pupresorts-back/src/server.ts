import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import healthRouter from './domains/health/controller';
import {router} from "@src/router";
import cors from 'cors';
import {ErrorHandling} from "@src/utils/errors";

// Registrar rutas


/******************************************************************************
                                Setup
******************************************************************************/

const app = express();

// **** Middleware **** //

app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Routers
app.use('/health', healthRouter);
app.use('/api', router)

// Error handling
app.use(ErrorHandling)

// Caddy
app.set('trust proxy', true)


/******************************************************************************
                                Export default
******************************************************************************/

export default app;
