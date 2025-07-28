import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { MemberService } from '../member/member.service';
import { Model, ObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ViewService } from '../view/view.service';
import { ProductService } from '../product/product.service';
import {
  CommentInput,
  CommentsInquiry,
} from '../../libs/dto/comment/comment.input';
import { Comment, Comments } from '../../libs/dto/comment/comment';
import { Direction, Message } from '../../libs/enums/common.enum';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { CommentUpdate } from '../../libs/dto/comment/comment.update';
import { ArticleStatus } from '../../libs/enums/community.enum';
import { lookUpMember } from '../../libs/config';
import { T } from '../../libs/types/common';
import { NotificationService } from '../notification/notification.service';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import {
  NotificationGroup,
  NotificationType,
} from '../../libs/enums/notification.enum';

@Injectable()
export class CommentService {
  boardArticleService: any;
  propertyService: any;
  constructor(
    @InjectModel('Comment')
    private readonly commentModel: Model<Comment>,
    private memberService: MemberService,
    private notificationService: NotificationService,
  ) {}
  //createComment
  public async createComment(
    memberId: ObjectId,
    input: CommentInput,
  ): Promise<Comment> {
    input.memberId = memberId;
    let result: Comment | null;
    let notificationInput: NotificationInput;

    try {
      result = await this.commentModel.create(input);

      notificationInput = {
        notificationType: NotificationType.COMMENT,
        notificationGroup: NotificationGroup.COMMENT,
        notificationMessage: input.commentContent,
        targetRefId: input.commentRefId,
        memberId: memberId,
      };

      await this.notificationService.createNotification(notificationInput);
    } catch (error) {
      throw new BadRequestException(Message.CREATE_FAILED);
    }
    if (!input.parentCommentId) {
      switch (input.commentGroup) {
        case CommentGroup.ARTICLE:
          notificationInput = {
            notificationType: NotificationType.COMMENT,
            notificationGroup: NotificationGroup.ARTICLE,
            notificationMessage: input.commentContent,
            targetRefId: input.commentRefId,
            memberId: memberId,
          };

          await this.notificationService.createNotification(notificationInput);

          await this.boardArticleService.boardArticleStatsEditor({
            _id: input.commentRefId,
            targetKey: 'articleComments',
            modifier: 1,
          });

        case CommentGroup.PROPERTY:
          notificationInput = {
            notificationType: NotificationType.COMMENT,
            notificationGroup: NotificationGroup.PROPERTY,
            notificationMessage: input.commentContent,
            targetRefId: input.commentRefId,
            memberId: memberId,
          };
          await this.notificationService.createNotification(notificationInput);

          await this.propertyService.propertyStatsEditor({
            _id: input.commentRefId,
            targetKey: 'propertyComments',
            modifier: 1,
          });

        case CommentGroup.MEMBER:
          notificationInput = {
            notificationType: NotificationType.COMMENT,
            notificationGroup: NotificationGroup.MEMBER,
            notificationMessage: input.commentContent,
            targetRefId: input.commentRefId,
            memberId: memberId,
          };
          await this.notificationService.createNotification(notificationInput);

          await this.memberService.memberStatsEditor({
            _id: input.commentRefId,
            targetKey: 'memberComments',
            modifier: 1,
          });
      }
    }
    if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);
    return result;
  }
  //updateComment
  public async updateComment(
    memberId: ObjectId,
    input: CommentUpdate,
  ): Promise<Comment> {
    const result = await this.commentModel.findOneAndUpdate(
      {
        _id: input._id,
        memberId: memberId,
        commentStatus: CommentStatus.ACTIVE,
      },
      input,
      { new: true },
    );
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
    return result;
  }
  //getComments
  public async getComments(
    memberId: ObjectId,
    input: CommentsInquiry,
  ): Promise<Comments> {
    const { commentRefId } = input.search;
    const match: T = {
      commentRefId: commentRefId,
      commentStatus: CommentStatus.ACTIVE,
    };
    const sort: T = {
      [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
    };

    const result = await this.commentModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              //liked
              lookUpMember,
              { $unwind: '$memberData' },
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

  public async removeCommentByAdmin(commentId: ObjectId): Promise<Comment> {
    const result = await this.commentModel.findByIdAndDelete(commentId);
    if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
    return result;
  }
}
