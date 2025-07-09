import { Injectable } from '@nestjs/common';
import { MemberService } from '../member/member.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ViewService } from '../view/view.service';
import { ProductService } from '../product/product.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('Comment')
    private readonly commentModel: Model<Comment>,
    private memberService: MemberService,
    private viewService: ViewService,
    private productService: ProductService,
  ) {}
}
