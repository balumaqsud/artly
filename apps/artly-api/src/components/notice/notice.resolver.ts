import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { NoticeService } from './notice.service';
import { Notice } from '../../libs/dto/notice/notice';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { NoticeInput } from '../../libs/dto/notice/notice.input';

@Resolver()
export class NoticeResolver {
  constructor(private readonly noticeService: NoticeService) {}

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation((returns) => Notice)
  public async createNotice(
    @Args('input') input: NoticeInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Notice> {
    console.log('mutation, create article');
    return await this.noticeService.createNotice(memberId, input);
  }
}
