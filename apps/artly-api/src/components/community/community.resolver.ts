import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CommunityService } from './community.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Article, Articles } from '../../libs/dto/board-article/article';
import {
  AllArticlesInquiry,
  ArticleInput,
  ArticlesInquiry,
} from '../../libs/dto/board-article/article.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeId } from '../../libs/config';
import { ArticleUpdate } from '../../libs/dto/board-article/article.update';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { Roles } from '../auth/decorators/roles.decorator';

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
    console.log('query, get articles');
    return await this.communityService.getArticles(memberId, input);
  }

  //liking
  @UseGuards(AuthGuard)
  @Mutation(() => Article)
  public async likeTargetArticle(
    @Args('articleId') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Article> {
    console.log('Mutation: likeTargetArticle');
    const targetId = shapeId(input);
    return await this.communityService.likeTargetArticle(memberId, targetId);
  }

  //admin
  //getAllArticlesByAdmin
  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query((returns) => Articles)
  public async getAllArticlesByAdmin(
    @Args('input') input: AllArticlesInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ) {
    console.log('query: getAllArticlesByAdmin');
    return await this.communityService.getAllArticlesByAdmin(input);
  }
  //updateArticleByAdmin
  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation((returns) => Article)
  public async updateArticleByAdmin(
    @Args('input') input: ArticleUpdate,
    @AuthMember('_id') memberId: ObjectId,
  ) {
    console.log('mutation: updateArticleByAdmin');
    input._id = shapeId(input._id); //argument.  function
    return await this.communityService.updateArticleByAdmin(input);
  }
  //removeArticle
  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation((returns) => Article)
  public async removeArticle(
    @Args('articleId') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ) {
    console.log('mutation: removeArticle');
    const articleId = shapeId(input);
    return await this.communityService.removeArticle(articleId);
  }
}
