import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { Routes } from '@interfaces/routes.interface';
import { LOG_FORMAT, NODE_ENV, ORIGIN, PORT, CREDENTIALS } from '@config/index';
import { logger, stream } from '@utils/loggers';
import CorsMiddleware from '@middlewares/cors.middlewares';
import errorMiddleware from '@/middlewares/error.middleware';
import chalk from 'chalk';

class App {
    public app: express.Application;
    public env: string;
    public port: string | number;

    constructor(routes: Routes[]) {
        this.app = express();
        this.env = NODE_ENV || 'none';
        this.port = PORT || 3000;

        this.initializeMiddlewares();
        this.initializeRoutes(routes);
        this.initializeErrorHandling();
    }

    public listen() {
        this.app.listen(this.port, () => {
            logger.info(`=====================================`);
            logger.info(`======= ENV: ${chalk.red(this.env)} =======`);
            logger.info(`Listening on the port: ${chalk.green(this.port)}`);
            logger.info(`Link: ${chalk.bgGreenBright('http://localhost:' + this.port)}/`);
            logger.info(`=====================================`);
        });
    }

    public getServer(): express.Application {
        return this.app;
    }

    private initializeMiddlewares() {
        this.app.use(morgan(LOG_FORMAT, { stream }));

        this.app.use(
            cors({
                origin: ORIGIN,
                credentials: CREDENTIALS,
            }),
        );

        this.app.use(CorsMiddleware);

        this.app.use(hpp());
        this.app.use(
            helmet({
                contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
                crossOriginEmbedderPolicy: false,
            }),
        );
        this.app.use(compression());

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(cookieParser());
    }

    private initializeRoutes(routes: Routes[]) {
        routes.forEach(route => {
            this.app.use('/', route.router);
        });
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
    }
}

export default App;
