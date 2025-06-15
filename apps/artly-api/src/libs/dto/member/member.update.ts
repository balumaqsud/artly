import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { MemberStatus, MemberType } from '../../enums/member.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class MemberUpdate {
  @IsNotEmpty()
  @Field(() => String)
  _id?: ObjectId;

  @IsOptional()
  @Length(3, 16)
  @Field(() => String, { nullable: true })
  memberNick?: string;

  @IsOptional()
  @Field(() => MemberType, { nullable: true })
  memberType?: MemberType;

  @IsOptional()
  @Field(() => MemberStatus, { nullable: true })
  memberStatus?: MemberStatus;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberPhone?: string;

  @IsOptional()
  @Length(6, 18)
  @Field(() => String, { nullable: true })
  memberPassword: string;

  @IsOptional()
  @Length(6, 100)
  @Field(() => String, { nullable: true })
  memberFullName?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberAddress?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberImage?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberDesc?: string;

  deleteAt: Date;
}
