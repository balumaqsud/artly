import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { MemberService } from '../member/member.service';
import { ViewService } from '../view/view.service';
import { Article } from '../../libs/dto/board-article/article';
import { ArticleInput } from '../../libs/dto/board-article/article.input';
import { Message } from '../../libs/enums/common.enum';
import { ArticleStatus } from '../../libs/enums/Community.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { StatisticModifier } from '../../libs/types/common';
import { ArticleUpdate } from '../../libs/dto/board-article/article.update';

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel('Community')
    private readonly communityModel: Model<Article>,
    private memberService: MemberService,
    private viewService: ViewService,
    // private likeService: LikeService,
  ) {}

  public async createArticle(
    memberId: ObjectId,
    input: ArticleInput,
  ): Promise<Article> {
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

  public async getArticle(
    memberId: ObjectId,
    articleId: ObjectId,
  ): Promise<Article> {
    const search = { _id: articleId, articleStatus: ArticleStatus.ACTIVE };
    const result = await this.communityModel.findOne(search).exec();

    if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    if (memberId) {
      const viewInput = {
        memberId: memberId,
        viewRefId: articleId,
        viewGroup: ViewGroup.ARTICLE,
      };
      const newView = await this.viewService.recordView(viewInput);
      if (newView) {
        await this.articleStatsEditor({
          _id: articleId,
          targetKey: 'articleViews',
          modifier: 1,
        });
        result.articleViews++;
      }
      //liked
    }
    result.memberData = await this.memberService.getMember(
      null,
      result.memberId,
    );

    return result;
  }

  public async updateArticle(
    memberId: ObjectId,
    input: ArticleUpdate,
  ): Promise<Article> {
    const match = {
      _id: input._id,
      memberId: memberId,
      articleStatus: ArticleStatus.ACTIVE,
    };

    const result = await this.communityModel
      .findOneAndUpdate(match, input, { new: true })
      .exec();
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    if ((input.articleStatus = ArticleStatus.DELETE)) {
      await this.memberService.memberStatsEditor({
        _id: memberId,
        targetKey: 'memberArticles',
        modifier: -1,
      });
    }
    return result;
  }

  ///
  public async articleStatsEditor(
    input: StatisticModifier,
  ): Promise<Article | null> {
    const { _id, targetKey, modifier } = input;
    return await this.communityModel
      .findOneAndUpdate(
        _id,
        {
          $inc: { [targetKey]: modifier },
        },
        { new: true },
      )
      .exec();
  }
}
