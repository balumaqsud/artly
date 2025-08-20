import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Member } from '../../libs/dto/member/member';
import { T } from '../../libs/types/common';
import { shapeId } from '../../libs/config';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  public async hasPassword(memberPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(memberPassword, salt);
  }

  public async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  public async createToken(member: Member): Promise<string> {
    const payload: T = {};
    //copied
    Object.keys(member['_doc'] ? member['_doc'] : member).map((ele) => {
      payload[`${ele}`] = member[`${ele}`];
    });

    delete payload.memberPassword;
    return this.jwtService.signAsync(payload);
  }

  public async verifyToken(token: string): Promise<Member> {
    try {
      const member = await this.jwtService.verifyAsync(token);
      member._id = shapeId(member._id);
      return member;
    } catch (err: any) {
      if (err?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }
      throw new UnauthorizedException(
        'You are not authenticated, please login first!',
      );
    }
  }
}
