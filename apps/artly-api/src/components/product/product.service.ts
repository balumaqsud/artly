import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Product, Products } from '../../libs/dto/product/product';
import { MemberService } from '../member/member.service';
import {
  AllProductsInquiry,
  OrdinaryInquiry,
  ProductInput,
  ProductsInquiry,
  SellerProductsInquiry,
} from '../../libs/dto/product/product.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { ProductStatus } from '../../libs/enums/product.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import {
  lookUpAuthMemberLiked,
  lookUpMember,
  shapeId,
} from '../../libs/config';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeInput } from '../../libs/dto/like/like.input';
import * as moment from 'moment';
import { ViewService } from '../view/view.service';
import { ProductUpdate } from '../../libs/dto/product/product.update';
import slugify from 'slugify';
import { LikeService } from '../like/like.service';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import {
  NotificationGroup,
  NotificationType,
} from '../../libs/enums/notification.enum';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
    private memberService: MemberService,
    private viewService: ViewService,
    private likeService: LikeService,
    private notificationService: NotificationService,
  ) {}
  //createProduct
  public async createProduct(input: ProductInput): Promise<Product> {
    console.log('executed: createProduct');
    const slug = slugify(input.productTitle, { lower: true, strict: true });

    const existing = await this.productModel.findOne({ productSlug: slug });
    if (existing) {
      throw new BadRequestException('Product slug already exists');
    }

    try {
      const result = await this.productModel.create({
        ...input,
        productSlug: slug,
      });
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

  public async likeTargetProduct(
    memberId: ObjectId,
    targetId: ObjectId,
  ): Promise<Product> {
    const target = await this.productModel
      .findOne({
        _id: targetId,
        productStatus: ProductStatus.ACTIVE,
      })
      .exec();
    if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    const input: LikeInput = {
      memberId: memberId,
      likeRefId: targetId,
      likeGroup: LikeGroup.PRODUCT,
    };

    const modifier: number = await this.likeService.makeToggle(input);

    //notification
    const notificationInput: NotificationInput = {
      notificationType: NotificationType.LIKE,
      notificationGroup: NotificationGroup.PRODUCT,
      targetRefId: targetId,
      memberId: memberId,
    };

    await this.notificationService.createNotification(notificationInput);
    const result = await this.productStatsEditor({
      _id: targetId,
      targetKey: 'productLikes',
      modifier: modifier,
    });
    if (!result)
      throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);

    // reflect current like state on the returned product
    const likeCheckInput: LikeInput = {
      memberId: memberId,
      likeRefId: targetId,
      likeGroup: LikeGroup.PRODUCT,
    };
    result.meLiked = await this.likeService.checkLikeExistence(likeCheckInput);
    if (!result.meLiked) result.meLiked = [];

    return result;
  }

  //getProduct
  public async getProduct(
    memberId: ObjectId,
    productId: ObjectId,
  ): Promise<Product> {
    const search: T = {
      _id: productId,
      productStatus: ProductStatus.ACTIVE,
    };
    const targetProduct = await this.productModel.findOne(search).exec();
    if (!targetProduct)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    if (memberId) {
      const viewInput: ViewInput = {
        memberId: memberId,
        viewRefId: productId,
        viewGroup: ViewGroup.PRODUCT,
      };
      const newView = await this.viewService.recordView(viewInput);
      if (newView) {
        await this.productStatsEditor({
          _id: productId,
          targetKey: 'productViews',
          modifier: 1,
        });
        targetProduct.productViews++;
      }
      // liked?
      const input: LikeInput = {
        memberId: memberId,
        likeRefId: productId,
        likeGroup: LikeGroup.PRODUCT,
      };
      targetProduct.meLiked = await this.likeService.checkLikeExistence(input);
    }
    // ensure meLiked is at least an empty array for GraphQL consumers
    if (!targetProduct.meLiked) {
      targetProduct.meLiked = [];
    }
    targetProduct.memberData = await this.memberService.getMember(
      null,
      targetProduct.memberId,
    );
    return targetProduct;
  }

  //update Product
  public async updateProduct(
    memberId: ObjectId,
    input: ProductUpdate,
  ): Promise<Product> {
    let { productStatus, soldAt, deletedAt } = input;
    const search: T = {
      _id: input._id,
      memberId: memberId,
      productStatus: ProductStatus.ACTIVE,
    };

    if (productStatus === ProductStatus.SOLD) soldAt = moment().toDate();
    if (productStatus === ProductStatus.DELETE) deletedAt = moment().toDate();

    const result = await this.productModel.findOneAndUpdate(search, input, {
      new: true,
    });
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    if (soldAt || deletedAt) {
      await this.memberService.memberStatsEditor({
        _id: memberId,
        targetKey: 'memberProducts',
        modifier: -1,
      });
    }

    return result;
  }

  //////////get All products method
  public async getProducts(
    memberId: ObjectId,
    input: ProductsInquiry,
  ): Promise<Products> {
    const match: T = { productStatus: ProductStatus.ACTIVE };
    const sort: T = {
      [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
    };
    this.shapeMatchQuery(match, input);
    console.log('match', match);

    const result = await this.productModel
      .aggregate([
        { $match: match },
        {
          $sort: sort,
        },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookUpAuthMemberLiked(memberId, '$_id', LikeGroup.PRODUCT),
              lookUpMember,
              { $unwind: '$memberData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result[0];
  }

  public async getFavorites(
    memberId: ObjectId,
    input: OrdinaryInquiry,
  ): Promise<Products> {
    return await this.likeService.getFavoriteProducts(memberId, input);
  }

  public async getVisited(
    memberId: ObjectId,
    input: OrdinaryInquiry,
  ): Promise<Products> {
    return await this.viewService.getVisited(memberId, input);
  }

  public async getSellerProducts(
    memberId: ObjectId,
    input: SellerProductsInquiry,
  ): Promise<Products> {
    const { productStatus } = input.search;
    if (productStatus === ProductStatus.DELETE)
      throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);

    const match: T = {
      memberId: memberId,
      productStatus: productStatus ?? { $ne: ProductStatus.DELETE },
    };
    const sort: T = {
      [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
    };

    const result = await this.productModel
      .aggregate([
        { $match: match },
        {
          $sort: sort,
        },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookUpMember,
              { $unwind: '$memberData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result[0];
  }

  /////////////// admin methods
  public async getAllProductsByAdmin(
    input: AllProductsInquiry,
  ): Promise<Products> {
    const {
      productStatus,
      productLocation,
      productTitle,
      productCategory,
      typeList,
      pricesRange,
      productRank,
    } = input.search ?? {};

    const match: T = {};
    const sort: T = {
      [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
    };

    if (productStatus) match.productStatus = productStatus;
    if (productLocation) match.productLocation = productLocation;
    if (productTitle) match.productTitle = productTitle;
    if (productCategory) match.productCategory = productCategory;
    if (typeList) match.productType = { $in: typeList };
    if (pricesRange)
      match.productPrice = {
        $gte: pricesRange.start,
        $lte: pricesRange.end,
      };
    if (productRank) match.productRank = productRank;

    const result = await this.productModel
      .aggregate([
        { $match: match },
        {
          $sort: sort,
        },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookUpMember,
              { $unwind: '$memberData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result[0];
  }

  //admin product update
  public async updateProductByAdmin(input: ProductUpdate): Promise<Product> {
    let { productStatus, soldAt, deletedAt } = input;
    const search: T = {
      _id: input._id,
      productStatus: ProductStatus.ACTIVE,
    };

    if (productStatus === ProductStatus.SOLD) soldAt = moment().toDate();
    if (productStatus === ProductStatus.DELETE) deletedAt = moment().toDate();

    const result = await this.productModel.findOneAndUpdate(search, input, {
      new: true,
    });
    console.log(result);
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    if (soldAt || deletedAt) {
      await this.memberService.memberStatsEditor({
        _id: result.memberId,
        targetKey: 'memberProducts',
        modifier: -1,
      });
    }

    return result;
  }

  public async removeProductByAdmin(productId: ObjectId): Promise<Product> {
    const search: T = {
      _id: productId,
      productStatus: ProductStatus.DELETE,
    };

    const result = await this.productModel.findOneAndDelete(search).exec();
    if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
    return result;
  }

  /////////////// private methods
  private shapeMatchQuery(
    match: Record<string, any>,
    input: ProductsInquiry,
  ): void {
    const {
      memberId,
      productLocation,
      typeList,
      periodsRange,
      pricesRange,
      text,
    } = input.search;

    if (memberId) match.memberId = shapeId(memberId);
    if (productLocation) match.productLocation = { $in: productLocation };
    if (typeList) match.productType = { $in: typeList };

    if (pricesRange)
      match.productPrice = {
        $gte: pricesRange.start,
        $lte: pricesRange.end,
      };

    if (periodsRange)
      match.createdAt = {
        $gte: periodsRange.start,
        $lte: periodsRange.end,
      };

    if (text)
      match.productTitle = {
        $regex: new RegExp(text, 'i'),
      };
  }
  public async productStatsEditor(
    input: StatisticModifier,
  ): Promise<Product | null> {
    const { _id, targetKey, modifier } = input;
    shapeId(_id);
    return await this.productModel
      .findOneAndUpdate(
        { _id },
        {
          $inc: { [targetKey]: modifier },
        },
        { new: true },
      )
      .exec();
  }
}
