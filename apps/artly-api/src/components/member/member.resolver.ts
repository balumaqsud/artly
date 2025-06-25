import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { ObjectId } from 'mongoose';
import { shapeId } from '../../libs/config';

@Resolver()
export class MemberResolver {
  constructor(private readonly memberService: MemberService) {}

  @Mutation(() => Member)
  public async signup(@Args('input') input: MemberInput): Promise<Member> {
    console.log('mutation: signup');
    return await this.memberService.signup(input);
  }
  @Mutation(() => Member)
  public async login(@Args('input') input: LoginInput): Promise<Member> {
    console.log('mutation: login');
    return await this.memberService.login(input);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Member)
  public async updateMember(
    @Args('input') input: MemberUpdate,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Member> {
    console.log('mutation: updateMember');
    delete input._id;
    return await this.memberService.updateMember(memberId, input);
  }

  @Query(() => Member)
  public async getMember(
    @Args('memberId') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Member> {
    console.log('mutation: getMember');
    const targetId = shapeId(input);
    return await this.memberService.getMember(memberId, targetId);
  }

  //admin => authorization by roles guards

  @Roles(MemberType.ADMIN)
  @Mutation(() => String)
  public async getAllMembersByAdmin(): Promise<string> {
    console.log('mutation: getAllMembersByAdmin');
    return await this.memberService.getAllMembersByAdmin();
  }

  @Roles(MemberType.ADMIN)
  @Mutation(() => String)
  public async updateMemberByAdmin(): Promise<string> {
    console.log('mutation: updateMemberByAdmin');
    return await this.memberService.updateMemberByAdmin();
  }
}
