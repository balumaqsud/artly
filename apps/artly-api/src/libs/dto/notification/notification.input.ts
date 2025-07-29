import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';
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

@InputType()
export class NotificationsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;
}
