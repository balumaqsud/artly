import { Module } from '@nestjs/common';
import { MongooseModule, InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri:
          process.env.NODE_ENV === 'production'
            ? process.env.MONGO_PROD
            : process.env.MONGO_DEV,
      }),
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {
    if (connection.readyState) {
      console.log('this', connection.readyState);
      console.log(
        `Mongo DB connected to ${
          process.env.NODE_ENV === 'production' ? 'prod' : 'dev'
        } mode`,
      );
    } else {
      console.log('Mongo db is not connected');
    }
  }
}
