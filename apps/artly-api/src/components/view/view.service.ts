import { Injectable } from '@nestjs/common';
import { View } from '../../libs/dto/view/view';
import { Model, ObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ViewInput } from '../../libs/dto/view/view.input';
import { T } from '../../libs/types/common';
import { OrdinaryInquiry } from '../../libs/dto/product/product.input';
import { Products } from '../../libs/dto/product/product';
import { LikeGroup } from '../../libs/enums/like.enum';
import { lookupVisit } from '../../libs/config';

@Injectable()
export class ViewService {
  constructor(@InjectModel('View') private readonly viewModel: Model<View>) {}

  public async recordView(input: ViewInput): Promise<View | null> {
    const result = await this.checkViewExistence(input);
    if (!result) {
      console.log('view created');
      return await this.viewModel.create(input);
    } else {
      console.log('View already exists, returning null');
      return null;
    }
  }
  private async checkViewExistence(input: ViewInput): Promise<View | null> {
    const search: T = {
      memberId: input.memberId,
      viewRefId: input.viewRefId,
      viewGroup: input.viewGroup,
    };
    return await this.viewModel.findOne(search).exec();
  }

  public async getVisited(
    memberId: ObjectId,
    input: OrdinaryInquiry,
  ): Promise<Products> {
    const { page, limit } = input;
    const match: T = { likeGroup: LikeGroup.PRODUCT, memberId: memberId };

    const data: T = await this.viewModel
      .aggregate([
        { $match: match },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: 'products',
            localField: 'viewRefId',
            foreignField: '_id',
            as: 'visitedProduct',
          },
        },
        { $unwind: '$visitedProduct' },
        {
          $facet: {
            list: [
              {
                $skip: (page - 1) * limit,
              },
              { $limit: limit },
              lookupVisit,
              { $unwind: '$visitedProduct.memberData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    const result: Products = { list: [], metaCounter: data[0].metaCounter };
    result.list = data[0].list.map((ele) => ele.visitedProduct);
    return result;
  }
}
