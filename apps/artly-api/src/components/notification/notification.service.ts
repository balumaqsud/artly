import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import {
  NotificationInput,
  NotificationsInquiry,
} from '../../libs/dto/notification/notification.input';
import {
  Notification,
  Notifications,
} from '../../libs/dto/notification/notification';
import { Message } from '../../libs/enums/common.enum';
import { NotificationType } from '../../libs/enums/notification.enum';

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
      const existing = await this.notificationModel.findOne({
        memberId: input.memberId,
        targetRefId: input.targetRefId,
        notificationType: NotificationType.LIKE,
      });

      if (existing) {
        await this.notificationModel.deleteOne({ _id: existing._id });
        return existing;
      }

      return await this.notificationModel.create(input);
    } catch (error) {
      console.log('createNotification err:', error);
      throw new InternalServerErrorException(Message.BAD_REQUEST);
    }
  }
  public async getNotifications(
    memberId: ObjectId,
    input: NotificationsInquiry,
  ): Promise<Notifications> {
    const result = await this.notificationModel
      .aggregate([
        { $match: { memberId: memberId } },
        { $sort: { createdAt: -1 } },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result[0];
  }

  public async getNotification(
    memberId: ObjectId,
    notificationId: ObjectId,
  ): Promise<Notification> {
    const result = await this.notificationModel
      .findOne({
        memberId: memberId,
        _id: notificationId,
      })
      .exec();

    if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result;
  }

  public async removeNotification(
    memberId: ObjectId,
    notificationId: ObjectId,
  ): Promise<Notification> {
    const result = await this.notificationModel
      .findOneAndDelete({
        memberId: memberId,
        _id: notificationId,
      })
      .exec();

    if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

    return result;
  }
}
