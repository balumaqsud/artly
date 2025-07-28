import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import {
  NotificationGroup,
  NotificationStatus,
  NotificationType,
} from '../../enums/notification.enum';
import { TotalCounter } from '../member/member';

@ObjectType()
export class Notification {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => NotificationType)
  notificationType: NotificationType;

  @Field(() => NotificationStatus)
  notificationStatus: NotificationStatus;

  @Field(() => NotificationGroup)
  notificationGroup: NotificationGroup;

  @Field(() => String)
  noticeTitle: string;

  @Field(() => String)
  notificationMessage: string;

  @Field(() => String)
  targetRefId: ObjectId;

  @Field(() => String)
  memberId: ObjectId;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class Notifications {
  @Field(() => [Notification])
  list: Notification[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter: TotalCounter[];
}
