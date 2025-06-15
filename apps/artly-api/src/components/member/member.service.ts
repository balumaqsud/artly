import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Message } from '../../libs/enums/common.enum';
import { Member } from '../../libs/dto/member/member';
import { MemberStatus } from '../../libs/enums/member.enum';

@Injectable()
export class MemberService {
  constructor(
    @InjectModel('Member') private readonly memberModel: Model<Member>,
  ) {}
  public async signup(input: MemberInput): Promise<Member> {
    //hash
    try {
      const result = await this.memberModel.create(input);
      //auth
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
      return response;
    } catch (error) {
      throw new BadRequestException(Message.NO_DATA_FOUND);
    }
  }
  public async updateMember(): Promise<string> {
    return 'signup';
  }

  public async getMember(): Promise<string> {
    return 'signup';
  }
}
