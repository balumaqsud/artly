import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';

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
  @Mutation(() => String)
  public async updateMember(
    @AuthMember('_id') memberId: Member,
  ): Promise<string> {
    console.log('mutation: updateMember');
    console.log('authMember', memberId);
    return await this.memberService.updateMember();
  }

  @Query(() => String)
  public async getMember(): Promise<string> {
    console.log('mutation: getMember');
    return await this.memberService.getMember();
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
