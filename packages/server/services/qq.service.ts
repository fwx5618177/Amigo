import { HttpException } from '@/exceptions/HttpException';
import { isEmpty } from '@/utils/util';
import { QQMessageDto } from '@/dtos/qq.dto';

class QQService {
    public async findAllUser(qqMsg: QQMessageDto): Promise<void> {
        if (isEmpty(qqMsg)) throw new HttpException(400, 'User id not found');
    }
}

export default QQService;
