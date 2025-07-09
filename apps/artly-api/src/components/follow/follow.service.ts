import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Follower, Followers, Following } from '../../libs/dto/follow/follow';
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
      targetKey: 'memberFollowings',
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
      targetKey: 'memberFollowings',
      modifier: -1,
    });
    await this.memberService.memberStatsEditor({
      _id: followingId,
      targetKey: 'memberFollowers',
      modifier: -1,
    });

    return result;
  }

  //getMemberFollowings
  public async getMemberFollowings(
    memberId: ObjectId,
    input: FollowInquiry,
  ): Promise<Following> {
    const { page, limit, search } = input;
    if (!search?.followerId) throw new BadRequestException(Message.BAD_REQUEST);
    const match: T = {
      followerId: search?.followerId,
    };
    const result = await this.followModel
      .aggregate([
        { $match: match },
        { $sort: { createdAt: Direction.DESC } },
        {
          $facet: {
            list: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              lookUpAuthMemberLiked(memberId, '$followingId'), //liked?
              lookUpAuthMemberFollowed({
                followerId: memberId,
                followingId: '$followingId',
              }), //followed
              lookupFollowingData,
              { $unwind: '$followingData' },
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

  //getMemberFollowers
  public async getMemberFollowers(
    memberId: ObjectId,
    input: FollowInquiry,
  ): Promise<Followers> {
    const { page, limit, search } = input;
    if (!search?.followingId)
      throw new BadRequestException(Message.BAD_REQUEST);
    const match: T = {
      followingId: search?.followingId,
    };
    const result = await this.followModel
      .aggregate([
        { $match: match },
        { $sort: { createdAt: Direction.DESC } },
        {
          $facet: {
            list: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              lookUpAuthMemberLiked(memberId, '$followerId'), //liked?
              lookUpAuthMemberFollowed({
                followerId: memberId,
                followingId: '$followerId',
              }), //followed
              lookupFollowerData,
              { $unwind: '$followerData' },
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
}
