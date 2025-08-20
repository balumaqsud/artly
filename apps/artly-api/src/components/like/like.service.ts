import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Like, MeLiked } from '../../libs/dto/like/like';
import { LikeInput } from '../../libs/dto/like/like.input';
import { Message } from '../../libs/enums/common.enum';
import { OrdinaryInquiry } from '../../libs/dto/product/product.input';
import { Products } from '../../libs/dto/product/product';
import { LikeGroup } from '../../libs/enums/like.enum';
import { T } from '../../libs/types/common';
import { lookupFavorite } from '../../libs/config';

@Injectable()
export class LikeService {
  constructor(@InjectModel('Like') private readonly likeModel: Model<Like>) {}

  public async makeToggle(input: LikeInput): Promise<number> {
    const search = {
      memberId: input.memberId,
      likeRefId: input.likeRefId,
      likeGroup: input.likeGroup,
    };
    const exist = await this.likeModel.findOne(search).exec();

    let modifier = 1;
    if (exist) {
      await this.likeModel.findOneAndDelete(search).exec();
      modifier = -1;
    } else {
      try {
        await this.likeModel.create(input);
      } catch (error) {
        console.log('likeToggle err:', error);
        throw new InternalServerErrorException(Message.BAD_REQUEST);
      }
    }
    console.log(`like modifier: ${modifier}`);
    return modifier;
  }

  public async checkLikeExistence(input: LikeInput): Promise<MeLiked[]> {
    const { memberId, likeRefId, likeGroup } = input;
    const result = await this.likeModel.findOne({
      memberId: memberId,
      likeRefId: likeRefId,
      likeGroup: likeGroup,
    });
    return result
      ? [
          {
            memberId: memberId,
            likeRefId: likeRefId,
            myFavorite: true,
          },
        ]
      : [];
  }

  public async getFavoriteProducts(
    memberId: ObjectId,
    input: OrdinaryInquiry,
  ): Promise<Products> {
    const { page, limit } = input;
    const match: T = { likeGroup: LikeGroup.PRODUCT, memberId: memberId };

    const data: T = await this.likeModel
      .aggregate([
        { $match: match },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: 'products',
            localField: 'likeRefId',
            foreignField: '_id',
            as: 'favoriteProduct',
          },
        },
        { $unwind: '$favoriteProduct' },
        {
          $facet: {
            list: [
              {
                $skip: (page - 1) * limit,
              },
              { $limit: limit },
              lookupFavorite,
              { $unwind: '$favoriteProduct.memberData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    const result: Products = { list: [], metaCounter: data[0].metaCounter };
    result.list = data[0].list.map((ele) => ele.favoriteProduct);
    return result;
  }
}
