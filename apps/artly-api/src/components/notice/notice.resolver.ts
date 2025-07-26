import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NoticeService } from './notice.service';
import { Notice } from '../../libs/dto/notice/notice';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { NoticeInput } from '../../libs/dto/notice/notice.input';
import { shapeId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';
import { NoticeUpdate } from '../../libs/dto/notice/notice.update';

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

  @UseGuards(WithoutGuard)
  @Query((returns) => Notice)
  public async getNotice(
    @Args('input') input: String,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Notice> {
    console.log('query, get notice');
    const noticeId = shapeId(input);
    return await this.noticeService.getNotice(memberId, noticeId);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation((returns) => Notice)
  public async updateNotice(
    @Args('input') input: NoticeUpdate,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Notice> {
    console.log('mutation, updateNotice');
    input._id = shapeId(input._id);
    return await this.noticeService.updateNotice(memberId, input);
  }
}
