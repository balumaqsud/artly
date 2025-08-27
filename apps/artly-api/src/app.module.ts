import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { ComponentsModule } from './components/components.module';
import { DatabaseModule } from './database/database.module';
import { T } from './libs/types/common';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [
    // integration of config/env
    ConfigModule.forRoot(),
    // integration of graphql api
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      introspection: true,
      // Configure CORS for Docker networking
      cors: {
        origin: [
          'http://localhost:4001',
          'http://localhost:3000',
          'http://localhost:3001',
          'http://host.docker.internal:4001',
        ],
        credentials: true,
      },
      //global integration of error handling
      formatError: (error: T) => {
        const graphqlError = {
          code: error?.extensions?.code,
          message:
            error?.extensions?.exception?.response?.message ?? error?.message,
        };
        return graphqlError;
      },
    }),

    ComponentsModule,
    DatabaseModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
