import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { CommentGroup, CommentStatus } from '../../enums/comment.enum';
import { Member, TotalCounter } from '../member/member';
import { MeLiked } from '../like/like';

@ObjectType()
export class Comment {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => CommentStatus)
  commentStatus: CommentStatus;

  @Field(() => CommentGroup)
  commentGroup: CommentGroup;

  @Field(() => String)
  commentContent: string;

  @Field(() => String)
  commentRefId: ObjectId;

  @Field(() => Number)
  commentLikes: number;

  @Field(() => String)
  memberId: ObjectId;

  @Field(() => String, { nullable: true })
  parentCommentId?: ObjectId;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  /** from aggregation **/

  @Field(() => Member, { nullable: true })
  memberData?: Member;

  ///aggregation
  @Field(() => [MeLiked], { nullable: true })
  meLiked?: MeLiked[];

  @Field(() => [Comment], { nullable: true })
  replies?: Comment[];
}

@ObjectType()
export class Comments {
  @Field(() => [Comment])
  list: Comment[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter: TotalCounter[];
}
