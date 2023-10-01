import { IsString } from 'class-validator';

export class QQMessageDto {
    @IsString()
    public message!: string;
}
