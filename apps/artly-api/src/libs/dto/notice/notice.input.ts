import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ObjectId } from 'mongoose';
import { NoticeCategory, NoticeStatus } from '../../enums/notice.enum';

@InputType()
export class NoticeInput {
  @IsNotEmpty()
  @Field(() => String)
  memberId: ObjectId | null;

  @IsNotEmpty()
  @Field(() => NoticeCategory)
  noticeCategory: NoticeCategory;

  @IsOptional()
  @Field(() => NoticeStatus)
  noticeStatus: NoticeStatus;

  @IsNotEmpty()
  @Field(() => String)
  noticeTitle: string;

  @IsNotEmpty()
  @Field(() => String)
  noticeContent: string;
}
