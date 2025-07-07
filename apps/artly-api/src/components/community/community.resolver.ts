import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CommunityService } from './community.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Article } from '../../libs/dto/board-article/article';
import { ArticleInput } from '../../libs/dto/board-article/article.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeId } from '../../libs/config';

@Resolver()
export class CommunityResolver {
  constructor(private readonly communityService: CommunityService) {}

  @UseGuards(AuthGuard)
  @Mutation((returns) => Article)
  public async createArticle(
    @Args('input') input: ArticleInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Article> {
    console.log('mutation, create article');
    return await this.communityService.createArticle(memberId, input);
  }

  @UseGuards(WithoutGuard)
  @Query((returns) => Article)
  public async getArticle(
    @Args('input') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Article> {
    console.log('query, get article');
    const articleId = shapeId(input);
    return await this.communityService.getArticle(memberId, articleId);
  }
}
