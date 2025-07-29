import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { shapeId } from '../../libs/config';
import { NotificationService } from './notification.service';
import {
  Notification,
  Notifications,
} from '../../libs/dto/notification/notification';
import { NotificationsInquiry } from '../../libs/dto/notification/notification.input';

@Resolver()
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(AuthGuard)
  @Query((returns) => Notifications)
  public async getNotifications(
    @Args('input') input: NotificationsInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Notifications> {
    console.log('Query: getNotifications');
    return await this.notificationService.getNotifications(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Query((returns) => Notification)
  public async getNotification(
    @Args('notificationId') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Notification> {
    console.log('Query: getNotification');
    const notificationId = shapeId(input);
    return await this.notificationService.getNotification(
      memberId,
      notificationId,
    );
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => Notification)
  public async removeNotification(
    @Args('notificationId') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Notification> {
    console.log('mutation: removeNotification');
    const notificationId = shapeId(input);
    return await this.notificationService.removeNotification(
      memberId,
      notificationId,
    );
  }
}
