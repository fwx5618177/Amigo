export interface EnvProps {
    CREDENTIALS: boolean;
    ORIGIN: string;
    NODE_ENV: string;
    PORT: string | number;
    SECRET_KEY: string;
    LOG_FORMAT: string;
    LOG_DIR: string;
}

export enum EnvFile {
    development = 'development',
    production = 'production',
    dev = 'test',
}
