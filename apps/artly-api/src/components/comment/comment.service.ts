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
import { CommentInput } from '../../libs/dto/comment/comment.input';
import { Comment } from '../../libs/dto/comment/comment';
import { Message } from '../../libs/enums/common.enum';
import { CommentGroup } from '../../libs/enums/comment.enum';

@Injectable()
export class CommentService {
  boardArticleService: any;
  propertyService: any;
  constructor(
    @InjectModel('Comment')
    private readonly commentModel: Model<Comment>,
    private memberService: MemberService,
    private viewService: ViewService,
    private productService: ProductService,
  ) {}

  public async createComment(
    memberId: ObjectId,
    input: CommentInput,
  ): Promise<Comment> {
    input.memberId = memberId;
    let result: Comment | null;

    try {
      result = await this.commentModel.create(input);
    } catch (error) {
      throw new BadRequestException(Message.CREATE_FAILED);
    }
    if (!input.parentCommentId) {
      switch (input.commentGroup) {
        case CommentGroup.ARTICLE:
          await this.boardArticleService.boardArticleStatsEditor({
            _id: input.commentRefId,
            targetKey: 'articleComments',
            modifier: 1,
          });

        case CommentGroup.PROPERTY:
          await this.propertyService.propertyStatsEditor({
            _id: input.commentRefId,
            targetKey: 'propertyComments',
            modifier: 1,
          });

        case CommentGroup.MEMBER:
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
}
