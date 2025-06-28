import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../../libs/dto/product/product';
import { MemberService } from '../member/member.service';
import { ProductInput } from '../../libs/dto/product/product.input';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('Property') private readonly productModel: Model<Product>,
    private memberService: MemberService,
  ) {}
  //createProperty
  public async createProduct(input: ProductInput): Promise<Product> {
    console.log('executed: createProduct');
    try {
      const result = await this.productModel.create(input);
      // increase member products
      await this.memberService.memberStatsEditor({
        _id: result.memberId,
        targetKey: 'memberProducts',
        modifier: 1,
      });
      return result;
    } catch (error) {
      console.log('createProduct service', error);
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }
}
