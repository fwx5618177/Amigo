import QQService from '@/services/qq.service';
import { NextFunction, Request, Response } from 'express';

class QQController {
    public userService: QQService = new QQService();

    public index = (req: Request, res: Response, next: NextFunction): void => {
        try {
            res.sendStatus(200);
        } catch (err) {
            next(err);
        }
    };
}

export default QQController;
