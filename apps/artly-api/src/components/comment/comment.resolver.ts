import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CommentService } from './comment.service';
import { ObjectId } from 'mongoose';
import { CommentInput } from '../../libs/dto/comment/comment.input';
import { Comment } from '../../libs/dto/comment/comment';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver()
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  //apis

  @UseGuards(AuthGuard)
  @Mutation((returns) => Comment)
  public async createArticle(
    @Args('input') input: CommentInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Comment> {
    console.log('mutation, create comment');
    return await this.commentService.createComment(memberId, input);
  }
}
