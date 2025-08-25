import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import {
  LoginInput,
  MemberInput,
  MembersInquiry,
  SellersInquiry,
} from '../../libs/dto/member/member.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { Member, Members } from '../../libs/dto/member/member';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { AuthService } from '../auth/auth.service';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { ViewService } from '../view/view.service';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import {
  lookUpAuthMemberLiked,
  lookUpAuthMemberFollowed,
  shapeId,
} from '../../libs/config';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeService } from '../like/like.service';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import {
  NotificationGroup,
  NotificationType,
} from '../../libs/enums/notification.enum';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class MemberService {
  constructor(
    @InjectModel('Member') private readonly memberModel: Model<Member>,
    private readonly authService: AuthService,
    private readonly viewService: ViewService,
    private readonly likeService: LikeService,
    private readonly notificationService: NotificationService,
  ) {}
  public async signup(input: MemberInput): Promise<Member> {
    //hash
    input.memberPassword = await this.authService.hasPassword(
      input.memberPassword,
    );
    try {
      const result = await this.memberModel.create(input);
      //auth
      result.accessToken = await this.authService.createToken(result);
      return result;
    } catch (error) {
      throw new BadRequestException(Message.USED_USERNAME_OR_PHONE);
    }
  }

  public async login(input: LoginInput): Promise<Member> {
    try {
      const { memberNick } = input;
      const response: Member | null = await this.memberModel
        .findOne({ memberNick: memberNick })
        .select('+memberPassword')
        .exec();

      if (!response || response.memberStatus === MemberStatus.DELETE) {
        throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
      } else if (response.memberStatus === MemberStatus.BLOCK) {
        throw new InternalServerErrorException(Message.BLOCKED_USER);
      }
      //auth
      const isMatch = await this.authService.comparePassword(
        input.memberPassword,
        response.memberPassword,
      );
      if (!isMatch) {
        throw new BadRequestException(Message.WRONG_PASSWORD);
      }
      //token
      response.accessToken = await this.authService.createToken(response);
      return response;
    } catch (error) {
      throw new BadRequestException(Message.NO_DATA_FOUND);
    }
  }
  public async updateMember(
    memberId: ObjectId,
    input: MemberUpdate,
  ): Promise<Member> {
    const result = await this.memberModel
      .findOneAndUpdate(
        { _id: memberId, memberStatus: MemberStatus.ACTIVE },
        input,
        { new: true },
      )
      .exec();
    if (!result) {
      throw new InternalServerErrorException(Message.UPDATE_FAILED);
    }
    return result;
  }

  public async getMember(
    memberId: ObjectId | null,
    targetId: ObjectId,
  ): Promise<Member> {
    console.log(
      'getMember called with memberId:',
      memberId,
      'targetId:',
      targetId,
    );

    const search: T = {
      _id: targetId,
      memberStatus: { $in: [MemberStatus.ACTIVE, MemberStatus.BLOCK] },
    };

    // Use aggregation to include meFollowed and meLiked fields
    const pipeline: any[] = [{ $match: search }];

    // Add lookups for authenticated users
    if (memberId) {
      // Add meFollowed lookup
      pipeline.push(
        lookUpAuthMemberFollowed({
          followerId: memberId,
          followingId: '$_id',
        }),
      );

      // Add meLiked lookup
      pipeline.push(lookUpAuthMemberLiked(memberId, '$_id', LikeGroup.MEMBER));
    }

    const result = await this.memberModel.aggregate(pipeline).exec();

    if (!result || result.length === 0) {
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    }

    const member = result[0];
    console.log('Found member with current memberViews:', member.memberViews);

    // Handle view recording and memberViews increment
    if (memberId && memberId.toString() !== targetId.toString()) {
      console.log(
        'Recording view for member:',
        targetId,
        'by member:',
        memberId,
      );
      const viewInput: ViewInput = {
        memberId: memberId,
        viewRefId: targetId,
        viewGroup: ViewGroup.MEMBER,
      };
      const newView = await this.viewService.recordView(viewInput);
      console.log('New view created:', !!newView);
      if (newView) {
        console.log('Incrementing memberViews for member:', targetId);
        await this.memberModel
          .findOneAndUpdate(search, { $inc: { memberViews: 1 } }, { new: true })
          .exec();
        member.memberViews++;
        console.log('memberViews incremented to:', member.memberViews);
      } else {
        console.log('View already exists, not incrementing memberViews');
      }
    } else if (memberId) {
      console.log('Member viewing themselves, not recording view');
    }

    // Fetch the latest member data to ensure we have the updated memberViews
    const updatedResult = await this.memberModel.findOne(search).exec();
    if (updatedResult) {
      member.memberViews = updatedResult.memberViews;
    }

    // Ensure meFollowed and meLiked are arrays for GraphQL
    if (!member.meFollowed) member.meFollowed = [];
    if (!member.meLiked) member.meLiked = [];

    console.log('Final memberViews count:', member.memberViews);
    console.log('meFollowed:', member.meFollowed);
    console.log('meLiked:', member.meLiked);

    return member;
  }

  public async getSellers(
    memberId: ObjectId,
    input: SellersInquiry,
  ): Promise<Members> {
    console.log('getSellers input:', JSON.stringify(input, null, 2));
    const { text } = input.search || {};
    console.log('Extracted text:', text);
    const match: T = {
      memberType: MemberType.SELLER,
      memberStatus: MemberStatus.ACTIVE,
    };

    const sort: T = {
      [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
    };
    if (text) {
      // Search across multiple fields for better results
      match.$or = [
        { memberNick: { $regex: new RegExp(text, 'i') } },
        { memberFullName: { $regex: new RegExp(text, 'i') } },
        { memberPhone: { $regex: new RegExp(text, 'i') } },
      ];
      console.log('Added text search to match:', match);
    }

    console.log('Final match object:', JSON.stringify(match, null, 2));
    console.log('Sort object:', JSON.stringify(sort, null, 2));

    const result = await this.memberModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookUpAuthMemberLiked(memberId, '$_id', LikeGroup.MEMBER),
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    console.log('Query result count:', result[0]?.list?.length || 0);
    console.log('Total count:', result[0]?.metaCounter?.[0]?.total || 0);

    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result[0];
  }

  public async getAllMembersByAdmin(input: MembersInquiry): Promise<Members> {
    const { memberStatus, memberType, text } = input.search;
    const match: T = {};

    const sort: T = {
      [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
    };
    if (text) {
      match.memberNick = { $regex: new RegExp(text, 'i') };
    }
    if (memberStatus) match.memberStatus = memberStatus;
    if (memberType) match.memberType = memberType;
    const result = await this.memberModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
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
  public async likeTargetMember(
    memberId: ObjectId,
    targetId: ObjectId,
  ): Promise<Member> {
    const target = await this.memberModel
      .findOne({
        _id: targetId,
        memberStatus: MemberStatus.ACTIVE,
      })
      .exec();
    if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    const input: LikeInput = {
      memberId: memberId,
      likeRefId: targetId,
      likeGroup: LikeGroup.MEMBER,
    };

    const modifier: number = await this.likeService.makeToggle(input);

    const notificationInput: NotificationInput = {
      notificationType: NotificationType.LIKE,
      notificationGroup: NotificationGroup.MEMBER,
      targetRefId: targetId,
      memberId: memberId,
    };

    await this.notificationService.createNotification(notificationInput);

    const result = await this.memberStatsEditor({
      _id: targetId,
      targetKey: 'memberLikes',
      modifier: modifier,
    });
    if (!result)
      throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);

    return result;
  }

  public async updateMemberByAdmin(input: MemberUpdate): Promise<Member> {
    const result = await this.memberModel.findOneAndUpdate(
      { _id: input._id },
      input,
      { new: true },
    );
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    return result;
  }

  public async removeMemberByAdmin(memberId: ObjectId): Promise<Member> {
    const search: T = {
      _id: memberId,
    };

    const result = await this.memberModel.findOneAndDelete(search).exec();
    if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
    return result;
  }

  public async memberStatsEditor(
    input: StatisticModifier,
  ): Promise<Member | null> {
    const { _id, targetKey, modifier } = input;
    console.log(`memberStatsEditor called with:`, { _id, targetKey, modifier });

    try {
      // First, let's check the current value
      const currentMember = await this.memberModel.findById(_id).exec();
      console.log(`Current ${targetKey} value:`, currentMember?.[targetKey]);

      // Try the $inc operation
      const result = await this.memberModel
        .findByIdAndUpdate(
          _id,
          {
            $inc: { [targetKey]: modifier },
          },
          { new: true },
        )
        .exec();

      console.log(`memberStatsEditor result:`, result);
      console.log(`New ${targetKey} value:`, result?.[targetKey]);

      // Verify the update actually happened
      if (result && result[targetKey] !== currentMember?.[targetKey]) {
        console.log(
          `✅ ${targetKey} successfully updated from ${currentMember?.[targetKey]} to ${result[targetKey]}`,
        );
      } else {
        console.log(
          `❌ ${targetKey} update may have failed. Expected: ${(currentMember?.[targetKey] || 0) + modifier}, Got: ${result?.[targetKey]}`,
        );
      }

      return result;
    } catch (error) {
      console.error(`Error in memberStatsEditor:`, error);
      throw error;
    }
  }

  // Alternative method using direct update
  public async updateMemberStat(
    memberId: ObjectId,
    field: string,
    value: number,
  ): Promise<Member | null> {
    console.log(`updateMemberStat called with:`, { memberId, field, value });

    try {
      const result = await this.memberModel
        .findByIdAndUpdate(memberId, { [field]: value }, { new: true })
        .exec();

      console.log(`updateMemberStat result:`, result);
      return result;
    } catch (error) {
      console.error(`Error in updateMemberStat:`, error);
      throw error;
    }
  }
}
