import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import {
  LoginInput,
  MemberInput,
  MembersInquiry,
  SellersInquiry,
} from '../../libs/dto/member/member.input';
import { Member, Members } from '../../libs/dto/member/member';
import {
  BadRequestException,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { ObjectId } from 'mongoose';
import { getSerialForImage, shapeId, validMimeTypes } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';

import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';
import { Message } from '../../libs/enums/common.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

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

  @UseGuards(AuthGuard)
  @Query(() => String)
  public async checkAuth(
    @AuthMember('memberNick')
    memberNick: string,
    @AuthMember('_id')
    memberId: string,
  ): Promise<string> {
    console.log('Mutation: checkAuth');

    return `hi, ${memberNick}, ${memberId}`;
  }

  @Roles(MemberType.USER, MemberType.SELLER)
  @UseGuards(RolesGuard)
  @Query(() => String)
  public async checkAuthRoles(
    @AuthMember() authMember: Member,
  ): Promise<string> {
    console.log('Mutation: checkAuthRoles');
    return `Hi ${authMember.memberNick}, you are ${authMember.memberType} memberId: ${authMember._id}`;
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

  @UseGuards(WithoutGuard)
  @Query(() => Members)
  public async getSellers(
    @Args('input') input: SellersInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Members> {
    console.log('Query: getSellers');
    return await this.memberService.getSellers(memberId, input);
  }

  //image uploaders
  @UseGuards(AuthGuard)
  @Mutation((returns) => String)
  public async imageUploader(
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
    @Args('target') target: String,
  ): Promise<string> {
    console.log('Mutation: imageUploader');

    if (!filename) throw new BadRequestException(Message.UPLOAD_FAILED);
    const validMime = validMimeTypes.includes(mimetype);
    if (!validMime)
      throw new BadRequestException(Message.PROVIDE_ALLOWED_FORMAT);

    const imageName = getSerialForImage(filename);
    const url = `uploads/${target}/${imageName}`;
    const stream = createReadStream();

    const result = await new Promise((resolve, reject) => {
      stream
        .pipe(createWriteStream(url))
        .on('finish', async () => resolve(true))
        .on('error', () => reject(false));
    });
    if (!result) throw new InternalServerErrorException(Message.UPLOAD_FAILED);

    return `a: ${url}`;
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => [String])
  public async imagesUploader(
    @Args('files', { type: () => [GraphQLUpload] })
    files: Promise<FileUpload>[],
    @Args('target') target: String,
  ): Promise<string[]> {
    console.log('Mutation: imagesUploader');

    const uploadedImages: string[] = [];
    const promisedList = files.map(
      async (
        img: Promise<FileUpload>,
        index: number,
      ): Promise<Promise<void>> => {
        try {
          const { filename, mimetype, encoding, createReadStream } = await img;

          const validMime = validMimeTypes.includes(mimetype);
          if (!validMime)
            throw new BadRequestException(Message.PROVIDE_ALLOWED_FORMAT);

          const imageName = getSerialForImage(filename);
          const url = `uploads/${target}/${imageName}`;
          const stream = createReadStream();

          const result = await new Promise((resolve, reject) => {
            stream
              .pipe(createWriteStream(url))
              .on('finish', () => resolve(true))
              .on('error', () => reject(false));
          });
          if (!result) throw new BadRequestException(Message.UPLOAD_FAILED);

          uploadedImages[index] = url;
        } catch (err) {
          console.log('Error, file missing!');
        }
      },
    );
    await Promise.all(promisedList);
    return uploadedImages;
  }

  //liking
  @UseGuards(AuthGuard)
  @Mutation(() => Member)
  public async likeTargetMember(
    @Args('memberId') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Member> {
    console.log('Mutation: likeTargetMember');
    const targetId = shapeId(input);
    return await this.memberService.likeTargetMember(memberId, targetId);
  }

  //admin => authorization by roles guards
  @Roles(MemberType.ADMIN)
  @Mutation(() => Members)
  public async getAllMembersByAdmin(
    @Args('input') input: MembersInquiry,
  ): Promise<Members> {
    console.log('mutation: getAllMembersByAdmin');
    return await this.memberService.getAllMembersByAdmin(input);
  }

  @Roles(MemberType.ADMIN)
  @Mutation(() => Member)
  public async updateMemberByAdmin(
    @Args('input') input: MemberUpdate,
  ): Promise<Member> {
    console.log('mutation: updateMemberByAdmin');

    return await this.memberService.updateMemberByAdmin(input);
  }
}
