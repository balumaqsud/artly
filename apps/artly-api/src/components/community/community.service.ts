import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { MemberService } from '../member/member.service';
import { ViewService } from '../view/view.service';
import { Article, Articles } from '../../libs/dto/board-article/article';
import {
  AllArticlesInquiry,
  ArticleInput,
  ArticlesInquiry,
} from '../../libs/dto/board-article/article.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { ArticleStatus } from '../../libs/enums/community.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { ArticleUpdate } from '../../libs/dto/board-article/article.update';
import {
  lookUpAuthMemberLiked,
  lookUpMember,
  shapeId,
} from '../../libs/config';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeService } from '../like/like.service';
import {
  NotificationGroup,
  NotificationType,
} from '../../libs/enums/notification.enum';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel('Community')
    private readonly communityModel: Model<Article>,
    private memberService: MemberService,
    private viewService: ViewService,
    private likeService: LikeService,
    private notificationService: NotificationService,
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

  //getArticles
  public async getArticles(
    memberId: ObjectId,
    input: ArticlesInquiry,
  ): Promise<Articles> {
    const { articleCategory, text } = input.search;
    const match: T = { articleStatus: ArticleStatus.ACTIVE };
    const sort: T = {
      [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
    };
    if (articleCategory) match.articleCategory = articleCategory;
    if (text) match.articleTitle = { $regex: new RegExp(text, 'i') };
    if (input.search?.memberId)
      match.memberId = shapeId(input.search?.memberId);
    console.log('getArticles match:', match);
    const result = await this.communityModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookUpAuthMemberLiked(memberId),
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

  public async likeTargetArticle(
    memberId: ObjectId,
    targetId: ObjectId,
  ): Promise<Article> {
    const target = await this.communityModel
      .findOne({
        _id: targetId,
        articleStatus: ArticleStatus.ACTIVE,
      })
      .exec();
    if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    const input: LikeInput = {
      memberId: memberId,
      likeRefId: targetId,
      likeGroup: LikeGroup.ARTICLE,
    };

    const modifier: number = await this.likeService.makeToggle(input);

    //notification
    const notificationInput: NotificationInput = {
      notificationType: NotificationType.LIKE,
      notificationGroup: NotificationGroup.ARTICLE,
      targetRefId: targetId,
      memberId: memberId,
    };
    await this.notificationService.createNotification(notificationInput);

    const result = await this.articleStatsEditor({
      _id: targetId,
      targetKey: 'articleLikes',
      modifier: modifier,
    });
    if (!result)
      throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);

    return result;
  }

  //admin
  public async getAllArticlesByAdmin(
    input: AllArticlesInquiry,
  ): Promise<Articles> {
    const { articleCategory, articleStatus } = input.search;
    const match: T = {};
    const sort: T = {
      [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
    };

    if (articleCategory) match.articleCategory = articleCategory;
    if (articleStatus) match.articleStatus = articleStatus;

    const result = await this.communityModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
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

  public async updateArticleByAdmin(input: ArticleUpdate): Promise<Article> {
    const match = {
      _id: input._id,
      articleStatus: ArticleStatus.ACTIVE,
    };

    const result = await this.communityModel
      .findOneAndUpdate(match, input, { new: true })
      .exec();
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    if ((input.articleStatus = ArticleStatus.DELETE)) {
      await this.memberService.memberStatsEditor({
        _id: result.memberId,
        targetKey: 'memberArticles',
        modifier: -1,
      });
    }
    return result;
  }
  public async removeArticle(articleId: ObjectId): Promise<Article> {
    const result = await this.communityModel
      .findByIdAndDelete({
        _id: articleId,
        articleStatus: ArticleStatus.DELETE,
      })
      .exec();

    if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

    return result;
  }

  // secondary methods
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
