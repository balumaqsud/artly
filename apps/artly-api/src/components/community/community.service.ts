import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { MemberService } from '../member/member.service';
import { ViewService } from '../view/view.service';
import { BoardArticle } from '../../libs/dto/board-article/board-article';
import { BoardArticleInput } from '../../libs/dto/board-article/board-article.input';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel('Community')
    private readonly communityModel: Model<BoardArticle>,
    private memberService: MemberService,
    private viewService: ViewService,
    // private likeService: LikeService,
  ) {}

  public async createArticle(
    input: BoardArticleInput,
    memberId: ObjectId,
  ): Promise<BoardArticle> {
    input.memberId = memberId;
    try {
      const result = await this.communityModel.create(input);
      await this.memberService.memberStatsEditor({
        _id: memberId,
        targetKey: 'memberArticles',
        modifier: 1,
      });
      return result;
    } catch (error) {
      console.log('create error', error);
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }
}
