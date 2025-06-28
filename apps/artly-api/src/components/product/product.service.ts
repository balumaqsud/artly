import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../../libs/dto/product/product';
import { MemberService } from '../member/member.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('Property') private readonly propertyModel: Model<Product>,
    private memberService: MemberService,
  ) {}
}
