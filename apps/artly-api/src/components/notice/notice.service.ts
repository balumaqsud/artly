import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notice } from '../../libs/dto/notice/notice';
import { Model, ObjectId } from 'mongoose';
import { MemberService } from '../member/member.service';
import { NoticeInput } from '../../libs/dto/notice/notice.input';
import { Message } from '../../libs/enums/common.enum';
import { NoticeStatus } from '../../libs/enums/notice.enum';
import { NoticeUpdate } from '../../libs/dto/notice/notice.update';

@Injectable()
export class NoticeService {
  constructor(
    @InjectModel('Notice')
    private readonly noticeModel: Model<Notice>,
    private memberService: MemberService,
  ) {}

  public async createNotice(
    memberId: ObjectId,
    input: NoticeInput,
  ): Promise<Notice> {
    input.memberId = memberId;
    try {
      const result = await this.noticeModel.create(input);
      return result;
    } catch (error) {
      console.log('create error', error);
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }

  public async getNotice(
    memberId: ObjectId,
    noticeId: ObjectId,
  ): Promise<Notice> {
    const search = { _id: noticeId, noticeStatus: NoticeStatus.HOLD };
    const result = await this.noticeModel.findOne(search).exec();

    if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result;
  }

  public async updateNotice(
    memberId: ObjectId,
    input: NoticeUpdate,
  ): Promise<Notice> {
    const match = {
      _id: input._id,
      memberId: memberId,
    };

    const result = await this.noticeModel
      .findOneAndUpdate(match, input, { new: true })
      .exec();
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    return result;
  }
}
