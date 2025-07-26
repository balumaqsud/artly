import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { ViewModule } from './view/view.module';
import { CommentModule } from './comment/comment.module';
import { CommunityModule } from './community/community.module';
import { FollowModule } from './follow/follow.module';
import { LikeModule } from './like/like.module';
import { NoticeModule } from './notice/notice.module';

@Module({
  imports: [
    MemberModule,
    ProductModule,
    AuthModule,
    ViewModule,
    CommentModule,
    CommunityModule,
    FollowModule,
    LikeModule,
    NoticeModule,
  ],
})
export class ComponentsModule {}
