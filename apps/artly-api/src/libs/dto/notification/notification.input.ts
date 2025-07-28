import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import {
  NotificationGroup,
  NotificationStatus,
  NotificationType,
} from '../../enums/notification.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class NotificationInput {
  @IsNotEmpty()
  @Field(() => NotificationType)
  notificationType: NotificationType;

  @IsNotEmpty()
  @Field(() => NotificationStatus)
  notificationStatus: NotificationStatus;

  @IsNotEmpty()
  @Field(() => NotificationGroup)
  notificationGroup: NotificationGroup;

  @IsNotEmpty()
  @Field(() => String)
  notificationMessage: string;

  @IsNotEmpty()
  @Field(() => String)
  targetRefId?: ObjectId;

  @IsNotEmpty()
  @Field(() => String)
  memberId?: ObjectId;
}
