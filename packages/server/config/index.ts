/**
 * 引入文件中的环境变量
 */

import { EnvProps } from '@/interfaces/config.interface'
import { config } from 'dotenv'

config({
    path: `.env`,
})

const configVar = process.env as EnvProps & any

export const { CREDENTIALS, NODE_ENV, PORT, SECRET_KEY, LOG_FORMAT, LOG_DIR, ORIGIN } = configVar
