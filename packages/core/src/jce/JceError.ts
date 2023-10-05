import { Log } from '../logs/Logs';

/**
 * JceError
 * @class JceError
 * @extends {Error}
 * @description Error class for Jce
 * @example
 * throw new JceError('JceError: foo');
 */
@Log.logErrorClass
class JceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'JceError';
    }
}

export default JceError;
