import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CommunityService } from './community.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Article, Articles } from '../../libs/dto/board-article/article';
import {
  ArticleInput,
  ArticlesInquiry,
} from '../../libs/dto/board-article/article.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeId } from '../../libs/config';
import { ArticleUpdate } from '../../libs/dto/board-article/article.update';

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

  @UseGuards(AuthGuard)
  @Mutation((returns) => Article)
  public async updateArticle(
    @Args('input') input: ArticleUpdate,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Article> {
    console.log('mutation, create article');
    input._id = shapeId(input._id);
    return await this.communityService.updateArticle(memberId, input);
  }

  @UseGuards(WithoutGuard)
  @Query((returns) => Articles)
  public async getArticles(
    @Args('input') input: ArticlesInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Articles> {
    console.log('query, get articless');
    return await this.communityService.getArticles(memberId, input);
  }
}
