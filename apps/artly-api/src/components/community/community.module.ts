import { Module } from '@nestjs/common';
import { CommunityResolver } from './community.resolver';
import { CommunityService } from './community.service';
import { MongooseModule } from '@nestjs/mongoose';
import CommunitySchema from '../../schemas/Community.model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import { MemberModule } from '../member/member.module';
import { LikeModule } from '../like/like.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Community', schema: CommunitySchema }]),
    AuthModule,
    ViewModule,
    MemberModule,
    LikeModule,
  ],
  providers: [CommunityResolver, CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
