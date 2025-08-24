import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import {
  Follower,
  Followers,
  Following,
  Followings,
} from '../../libs/dto/follow/follow';
import { Direction, Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';
import { FollowInquiry } from '../../libs/dto/follow/follow.input';
import { T } from '../../libs/types/common';
import {
  lookUpAuthMemberFollowed,
  lookUpAuthMemberLiked,
  lookupFollowerData,
  lookupFollowingData,
} from '../../libs/config';
import { LikeGroup } from '../../libs/enums/like.enum';

@Injectable()
export class FollowService {
  constructor(
    @InjectModel('Follow') private readonly followModel: Model<Follower>,
    private readonly memberService: MemberService,
  ) {}
  // following logic
  public async subscribe(
    followerId: ObjectId,
    followingId: ObjectId,
  ): Promise<Follower> {
    if (followerId.toString() === followingId.toString())
      throw new InternalServerErrorException(Message.SELF_SUBSCRIPTION_DENIED);

    const targetMember = await this.memberService.getMember(null, followingId);
    if (!targetMember)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    const result = await this.registerSub(followerId, followingId);

    await this.memberService.memberStatsEditor({
      _id: followerId,
      targetKey: 'memberFollowing',
      modifier: 1,
    });
    await this.memberService.memberStatsEditor({
      _id: followingId,
      targetKey: 'memberFollowers',
      modifier: 1,
    });

    return result;
  }
  ///private register subscribe logic
  private async registerSub(
    followerId: ObjectId,
    followingId: ObjectId,
  ): Promise<Follower> {
    try {
      return await this.followModel.create({
        followerId: followerId,
        followingId: followingId,
      });
    } catch (error) {
      console.log('reg sub err', error);
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }
  //unsubscribe
  public async unsubscribe(
    followerId: ObjectId,
    followingId: ObjectId,
  ): Promise<Follower> {
    if (followerId.toString() === followingId.toString())
      throw new InternalServerErrorException(Message.SELF_SUBSCRIPTION_DENIED);

    const targetMember = await this.memberService.getMember(null, followingId);
    if (!targetMember)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    const result = await this.followModel.findOneAndDelete({
      followerId: followerId,
      followingId: followingId,
    });
    if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    await this.memberService.memberStatsEditor({
      _id: followerId,
      targetKey: 'memberFollowing',
      modifier: -1,
    });
    await this.memberService.memberStatsEditor({
      _id: followingId,
      targetKey: 'memberFollowers',
      modifier: -1,
    });
    return result;
  }

  public async getMemberFollowings(
    memberId: ObjectId,
    input: FollowInquiry,
  ): Promise<Followings> {
    const { page, limit, search } = input;

    if (!search?.followerId) {
      throw new InternalServerErrorException(Message.BAD_REQUEST);
    }

    const match: T = { followerId: search?.followerId };
    console.log('Match', match);

    const result = await this.followModel
      .aggregate([
        { $match: match },
        { $sort: { createdAt: Direction.DESC } },
        {
          $facet: {
            list: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              lookUpAuthMemberLiked(memberId, '$followingId', LikeGroup.MEMBER),
              lookUpAuthMemberFollowed({
                followerId: memberId,
                followingId: '$followingId',
              }),
              lookupFollowingData,
              {
                $unwind: {
                  path: '$followingData',
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    if (!result[0])
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result[0];
  }

  public async getMemberFollowers(
    memberId: ObjectId,
    input: FollowInquiry,
  ): Promise<Followers> {
    const { page, limit, search } = input;

    if (!search?.followingId) {
      throw new InternalServerErrorException(Message.BAD_REQUEST);
    }

    const match: T = { followingId: search?.followingId };
    console.log('Match', match);

    const result = await this.followModel
      .aggregate([
        { $match: match },
        { $sort: { createdAt: Direction.DESC } },
        {
          $facet: {
            list: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              lookUpAuthMemberLiked(memberId, '$followerId', LikeGroup.MEMBER),
              lookUpAuthMemberFollowed({
                followerId: memberId,
                followingId: '$followerId',
              }),
              lookupFollowerData,
              {
                $unwind: {
                  path: '$followerData',
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    if (!result[0])
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result[0];
  }
}
