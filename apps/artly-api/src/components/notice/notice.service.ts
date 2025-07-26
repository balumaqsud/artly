import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notice } from '../../libs/dto/notice/notice';
import { Model, ObjectId } from 'mongoose';
import { MemberService } from '../member/member.service';
import { NoticeInput } from '../../libs/dto/notice/notice.input';
import { Message } from '../../libs/enums/common.enum';

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
}
