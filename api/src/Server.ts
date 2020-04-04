import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import { default as expressPlayground } from 'graphql-playground-middleware-express';

import express, { Request, Response, NextFunction } from 'express';
import { BAD_REQUEST } from 'http-status-codes';
import 'express-async-errors';
import { Db } from 'mongodb';

import HeartbeatRouter from './routes/Heartbeat';
import logger from '@shared/Logger';
import GraphqlMiddleware from 'src/middlewares/graphqlMiddleware'

const Server = async (db: Db) => {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    // Show routes called in console during development
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    }

    // Security
    if (process.env.NODE_ENV === 'production') {
        app.use(helmet());
    }

    // Add APIs
    app.use('/heartbeat', HeartbeatRouter);

    const graphqlMiddleware = await GraphqlMiddleware(db)
    app.post('/graphql', graphqlMiddleware)

    app.get('/graphql', expressPlayground({ endpoint: '/graphql' }))

    // Print API errors
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        logger.error(err.message, err);
        return res.status(BAD_REQUEST).json({
            error: err.message,
        });
    });

    return app
}

export default Server;
