import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Message } from '../../libs/enums/common.enum';
import { Member } from '../../libs/dto/member/member';
import { MemberStatus } from '../../libs/enums/member.enum';
import { AuthService } from '../auth/auth.service';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { ViewService } from '../view/view.service';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { T } from '../../libs/types/common';

@Injectable()
export class MemberService {
  constructor(
    @InjectModel('Member') private readonly memberModel: Model<Member>,
    private readonly authService: AuthService,
    private readonly viewService: ViewService,
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
    memberId: ObjectId,
    targetId: ObjectId,
  ): Promise<Member> {
    const search: T = {
      _id: targetId,
      memberStatus: { $in: [MemberStatus.ACTIVE, MemberStatus.BLOCK] },
    };
    const result = await this.memberModel.findOne(search).exec();
    if (!result) {
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    }

    if (memberId) {
      const viewInput: ViewInput = {
        memberId: memberId,
        viewRefId: targetId,
        viewGroup: ViewGroup.MEMBER,
      };
      const newView = await this.viewService.recordView(viewInput);
      if (newView) {
        await this.memberModel
          .findOneAndUpdate(search, { $inc: { memberViews: 1 } }, { new: true })
          .exec();
        result.memberViews++;
      }
    }
    return result;
  }

  public async getAllMembersByAdmin(): Promise<string> {
    return 'signup';
  }

  public async updateMemberByAdmin(): Promise<string> {
    return 'signup';
  }
}
