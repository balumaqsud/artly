import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import {
  NotificationGroup,
  NotificationType,
} from '../../enums/notification.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class NotificationInput {
  @IsNotEmpty()
  @Field(() => NotificationType)
  notificationType: NotificationType;

  @IsNotEmpty()
  @Field(() => NotificationGroup)
  notificationGroup: NotificationGroup;

  @IsOptional()
  @Field(() => String, { nullable: true })
  notificationMessage?: string;

  @IsNotEmpty()
  @Field(() => String)
  targetRefId?: ObjectId;

  @IsNotEmpty()
  @Field(() => String)
  memberId?: ObjectId;
}
