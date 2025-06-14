import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { ComponentsModule } from './components/components.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './componets/auth/auth.module';
import { CommentModule } from './componets/comment/comment.module';
import { LikeModule } from './componets/like/like.module';
import { ViewModule } from './componets/view/view.module';
import { FollowModule } from './componets/follow/follow.module';
import { CommunityModule } from './componets/community/community.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      playground: true,
      uploads: false,
      autoSchemaFile: true,
    }),
    ComponentsModule,
    DatabaseModule,
    AuthModule,
    CommentModule,
    LikeModule,
    ViewModule,
    FollowModule,
    CommunityModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
