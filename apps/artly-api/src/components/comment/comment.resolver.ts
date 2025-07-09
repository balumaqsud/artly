import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CommentService } from './comment.service';
import { ObjectId } from 'mongoose';
import {
  CommentInput,
  CommentsInquiry,
} from '../../libs/dto/comment/comment.input';
import { Comment, Comments } from '../../libs/dto/comment/comment';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { CommentUpdate } from '../../libs/dto/comment/comment.update';
import { shapeId } from '../../libs/config';

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

  @UseGuards(AuthGuard)
  @Mutation((returns) => Comment)
  public async updateComment(
    @Args('input') input: CommentUpdate,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Comment> {
    console.log('mutation: updateComment');
    input._id = shapeId(input._id);
    return await this.commentService.updateComment(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Query((returns) => Comments)
  public async getComments(
    @Args('input') input: CommentsInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Comments> {
    console.log('Query: getComments');
    input.search.commentRefId = shapeId(input.search.commentRefId);
    return await this.commentService.getComments(memberId, input);
  }
}
