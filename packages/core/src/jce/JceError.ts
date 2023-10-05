import { Log } from '../logs/Logs';

@Log.logErrorClass
class JceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'JceError';
    }
}

export default JceError;
