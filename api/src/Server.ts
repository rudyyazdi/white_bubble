import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import graphqlHTTP from 'express-graphql';
import { default as expressPlayground } from 'graphql-playground-middleware-express';

import express, { Request, Response, NextFunction } from 'express';
import { BAD_REQUEST } from 'http-status-codes';
import 'express-async-errors';

import HeartbeatRouter from './routes/Heartbeat';
import logger from '@shared/Logger';
import createSchema from 'src/graphql/schema'

// Init express
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

const schema = createSchema()
app.post(
    '/graphql',
    graphqlHTTP({
        schema,
        context: { hello: 'world' }
    }),
);

app.get('/graphql', expressPlayground({ endpoint: '/graphql' }))

// Print API errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message, err);
    return res.status(BAD_REQUEST).json({
        error: err.message,
    });
});

export default app;
