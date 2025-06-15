import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    HttpModule,
    JwtModule.register({
      secret: `${process.env.SECRET_KEY}`,
      signOptions: { expiresIn: '10d' },
    }),
  ],
  providers: [AuthService],
})
export class AuthModule {}
