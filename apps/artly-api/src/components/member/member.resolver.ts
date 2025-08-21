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
import { createWriteStream, mkdirSync } from 'fs';
import { join } from 'path';
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

  @UseGuards(WithoutGuard)
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
    console.log('Resolver input:', JSON.stringify(input, null, 2));
    return await this.memberService.getSellers(memberId, input);
  }

  //image uploaders
  @UseGuards(AuthGuard)
  @Mutation((returns) => String)
  public async imageUploader(
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
    @Args('target') target: string,
  ): Promise<string> {
    console.log('Mutation: imageUploader');
    console.log('Uploading file:', filename, 'to target:', target);

    try {
      if (!filename) throw new BadRequestException(Message.UPLOAD_FAILED);

      const validMime = validMimeTypes.includes(mimetype);
      if (!validMime) {
        throw new BadRequestException(Message.PROVIDE_ALLOWED_FORMAT);
      }

      const imageName = getSerialForImage(filename);
      const targetDir = join('uploads', target);
      const filePath = join(targetDir, imageName);

      // Create target directory if it doesn't exist
      try {
        mkdirSync(targetDir, { recursive: true });
      } catch (error) {
        console.error('Error creating directory:', error);
        throw new BadRequestException('Failed to create upload directory');
      }

      const stream = createReadStream();

      const result = await new Promise((resolve, reject) => {
        stream
          .pipe(createWriteStream(filePath))
          .on('finish', () => resolve(true))
          .on('error', (error) => {
            console.error('File write error:', error);
            reject(error);
          });
      });

      if (!result) {
        throw new InternalServerErrorException(Message.UPLOAD_FAILED);
      }

      console.log('File uploaded successfully:', filePath);
      return filePath;
    } catch (error) {
      console.error('Image upload error:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new BadRequestException('File upload failed');
    }
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => [String])
  public async imagesUploader(
    @Args('files', { type: () => [GraphQLUpload] })
    files: Promise<FileUpload>[],
    @Args('target') target: string,
  ): Promise<string[]> {
    console.log('Mutation: imagesUploader');

    const uploadedImages: string[] = [];
    const targetDir = join('uploads', target);

    // Create target directory if it doesn't exist
    try {
      mkdirSync(targetDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directory:', error);
      throw new BadRequestException('Failed to create upload directory');
    }

    const promisedList = files.map(
      async (img: Promise<FileUpload>, index: number): Promise<void> => {
        try {
          const { filename, mimetype, encoding, createReadStream } = await img;

          if (!filename) {
            console.log('Skipping file without filename');
            return;
          }

          const validMime = validMimeTypes.includes(mimetype);
          if (!validMime) {
            console.log('Invalid mime type:', mimetype);
            return;
          }

          const imageName = getSerialForImage(filename);
          const filePath = join(targetDir, imageName);
          const stream = createReadStream();

          const result = await new Promise((resolve, reject) => {
            stream
              .pipe(createWriteStream(filePath))
              .on('finish', () => resolve(true))
              .on('error', (error) => {
                console.error('File write error:', error);
                reject(error);
              });
          });

          if (result) {
            uploadedImages[index] = filePath;
            console.log('File uploaded successfully:', filePath);
          }
        } catch (err) {
          console.error('Error uploading file:', err);
        }
      },
    );

    await Promise.all(promisedList);
    return uploadedImages.filter(Boolean); // Remove any undefined entries
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
