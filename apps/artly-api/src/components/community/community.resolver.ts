import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CommunityService } from './community.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { BoardArticle } from '../../libs/dto/board-article/board-article';
import { BoardArticleInput } from '../../libs/dto/board-article/board-article.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';

@Resolver()
export class CommunityResolver {
  constructor(private readonly communityService: CommunityService) {}

  @UseGuards(AuthGuard)
  @Mutation((returns) => BoardArticle)
  public async createArticle(
    @Args('input') input: BoardArticleInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<BoardArticle> {
    console.log('mutation, create article');
    return await this.communityService.createArticle(input, memberId);
  }
}
