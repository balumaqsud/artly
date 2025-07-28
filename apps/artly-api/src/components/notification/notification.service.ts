import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MemberService } from '../member/member.service';
import { ProductService } from '../product/product.service';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { Notification } from '../../libs/dto/notification/notification';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('Notification')
    private readonly notificationModel: Model<Notification>,
  ) {}

  public async createNotification(
    input: NotificationInput,
  ): Promise<Notification> {
    try {
      return await this.notificationModel.create(input);
    } catch (error) {
      console.log('createNotification err:', error);
      throw new InternalServerErrorException(Message.BAD_REQUEST);
    }
  }
}
