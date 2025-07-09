import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FollowService } from './follow.service';
import { ObjectId } from 'mongoose';
import {
  Follower,
  Followers,
  Following,
  Followings,
} from '../../libs/dto/follow/follow';
import { shapeId } from '../../libs/config';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { WithoutGuard } from '../auth/guards/without.guard';
import { FollowInquiry } from '../../libs/dto/follow/follow.input';

@Resolver()
export class FollowResolver {
  constructor(private readonly followService: FollowService) {}

  //subscribe
  @UseGuards(AuthGuard)
  @Mutation((returns) => Follower)
  public async subscribe(
    @Args('input') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Follower> {
    console.log('mutation: subscribe');
    const followingId = shapeId(input);
    return await this.followService.subscribe(memberId, followingId);
  }
  //unsubscribe
  @UseGuards(AuthGuard)
  @Mutation((returns) => Follower)
  public async unsubscribe(
    @Args('input') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Follower> {
    console.log('mutation: unsubscribe');
    const followingId = shapeId(input);
    return await this.followService.unsubscribe(memberId, followingId);
  }

  //getMemberFollowings
  @UseGuards(WithoutGuard)
  @Query((returns) => Followings)
  public async getMemberFollowings(
    @Args('input') input: FollowInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Follower> {
    console.log('Query: getMemberFollowings');
    const { followerId } = input.search;
    input.search.followerId = shapeId(followerId);
    return await this.followService.getMemberFollowings(memberId, input);
  }

  //getMemberFollowings
  @UseGuards(WithoutGuard)
  @Query((returns) => Followers)
  public async getMemberFollowers(
    @Args('input') input: FollowInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Followers> {
    console.log('Query: getMemberFollowers');
    const { followingId } = input.search;
    input.search.followingId = shapeId(followingId);
    return await this.followService.getMemberFollowers(memberId, input);
  }
}
