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
import { lookUpAuthMemberLiked, shapeId } from '../../libs/config';
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
    const result = await this.memberModel.findOne(search).exec();
    if (!result) {
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    }
    console.log('Found member with current memberViews:', result.memberViews);

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
        result.memberViews++;
        console.log('memberViews incremented to:', result.memberViews);
      } else {
        console.log('View already exists, not incrementing memberViews');
      }
    } else if (memberId) {
      console.log('Member viewing themselves, not recording view');
    }

    // Fetch the latest member data to ensure we have the updated memberViews
    const updatedResult = await this.memberModel.findOne(search).exec();
    if (updatedResult) {
      result.memberViews = updatedResult.memberViews;
    }

    console.log('Final memberViews count:', result.memberViews);
    return result;
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

  public async memberStatsEditor(
    input: StatisticModifier,
  ): Promise<Member | null> {
    const { _id, targetKey, modifier } = input;
    return await this.memberModel
      .findByIdAndUpdate(
        _id,
        {
          $inc: { [targetKey]: modifier },
        },
        { new: true },
      )
      .exec();
  }
}
