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
    console.log('subscribe called with:', { followerId, followingId });

    if (followerId.toString() === followingId.toString())
      throw new InternalServerErrorException(Message.SELF_SUBSCRIPTION_DENIED);

    const targetMember = await this.memberService.getMember(null, followingId);
    if (!targetMember)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    // Check if follow already exists
    const existingFollow = await this.followModel
      .findOne({
        followerId: followerId,
        followingId: followingId,
      })
      .exec();

    if (existingFollow) {
      console.log('Follow already exists, returning existing record');
      return existingFollow;
    }

    // Create new follow record
    const result = await this.followModel.create({
      followerId: followerId,
      followingId: followingId,
    });
    console.log('New follow record created:', result);

    // Update stats using direct update instead of $inc
    try {
      console.log('Updating follower stats (memberFollowing)...');
      const followerUpdate = await this.memberService.updateMemberStat(
        followerId,
        'memberFollowing',
        (await this.getMemberFollowingCount(followerId)) + 1,
      );
      console.log('Follower stats updated:', followerUpdate?.memberFollowing);

      console.log('Updating following stats (memberFollowers)...');
      const followingUpdate = await this.memberService.updateMemberStat(
        followingId,
        'memberFollowers',
        (await this.getMemberFollowersCount(followingId)) + 1,
      );
      console.log('Following stats updated:', followingUpdate?.memberFollowers);
    } catch (error) {
      console.error('Error updating stats:', error);
      // If stats update fails, delete the follow record to maintain consistency
      await this.followModel.findByIdAndDelete(result._id);
      throw new InternalServerErrorException('Failed to update member stats');
    }

    return result;
  }

  //unsubscribe
  public async unsubscribe(
    followerId: ObjectId,
    followingId: ObjectId,
  ): Promise<Follower> {
    console.log('unsubscribe called with:', { followerId, followingId });

    if (followerId.toString() === followingId.toString())
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    const targetMember = await this.memberService.getMember(null, followingId);
    if (!targetMember)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    // Find and delete the follow record
    const result = await this.followModel.findOneAndDelete({
      followerId: followerId,
      followingId: followingId,
    });

    if (!result) {
      console.log('No follow record found to delete');
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    }

    console.log('Follow record deleted:', result);

    // Update stats using direct update instead of $inc
    try {
      console.log('Decrementing follower stats (memberFollowing)...');
      const followerUpdate = await this.memberService.updateMemberStat(
        followerId,
        'memberFollowing',
        (await this.getMemberFollowingCount(followerId)) - 1,
      );
      console.log('Follower stats updated:', followerUpdate?.memberFollowing);

      console.log('Decrementing following stats (memberFollowers)...');
      const followingUpdate = await this.memberService.updateMemberStat(
        followingId,
        'memberFollowers',
        (await this.getMemberFollowersCount(followingId)) - 1,
      );
      console.log('Following stats updated:', followingUpdate?.memberFollowers);
    } catch (error) {
      console.error('Error updating stats:', error);
      throw new InternalServerErrorException('Failed to update member stats');
    }

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

  // Helper method to get member following count
  private async getMemberFollowingCount(memberId: ObjectId): Promise<number> {
    const count = await this.followModel
      .countDocuments({
        followerId: memberId,
      })
      .exec();
    return count;
  }

  // Helper method to get member followers count
  private async getMemberFollowersCount(memberId: ObjectId): Promise<number> {
    const count = await this.followModel
      .countDocuments({
        followingId: memberId,
      })
      .exec();
    return count;
  }

  // Method to recalculate and sync follow counts
  public async recalculateFollowCounts(memberId: ObjectId): Promise<void> {
    console.log('Recalculating follow counts for member:', memberId);

    try {
      // Count how many people this member is following
      const followingCount = await this.getMemberFollowingCount(memberId);

      // Count how many followers this member has
      const followersCount = await this.getMemberFollowersCount(memberId);

      console.log('Calculated counts:', { followingCount, followersCount });

      // Update the member stats directly
      await this.memberService.updateMemberStat(
        memberId,
        'memberFollowing',
        followingCount,
      );
      await this.memberService.updateMemberStat(
        memberId,
        'memberFollowers',
        followersCount,
      );

      console.log('Follow counts recalculated and updated');
    } catch (error) {
      console.error('Error recalculating follow counts:', error);
      throw error;
    }
  }

  // Method to sync all member follow counts (for admin use)
  public async syncAllFollowCounts(): Promise<void> {
    console.log('Syncing all member follow counts...');

    try {
      // Get all unique member IDs from follows collection
      const followerIds = await this.followModel.distinct('followerId').exec();
      const followingIds = await this.followModel
        .distinct('followingId')
        .exec();
      const allMemberIds = [...new Set([...followerIds, ...followingIds])];

      console.log(`Found ${allMemberIds.length} members with follow activity`);

      for (const memberId of allMemberIds) {
        await this.recalculateFollowCounts(memberId);
      }

      console.log('All follow counts synced successfully');
    } catch (error) {
      console.error('Error syncing all follow counts:', error);
      throw error;
    }
  }
}
