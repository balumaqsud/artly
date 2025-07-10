import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { ProductType, ProductStatus } from '../../enums/product.enum';
import { Member, TotalCounter } from '../member/member';
import { MeLiked } from '../like/like';

@ObjectType()
export class Product {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => ProductType)
  productType: ProductType;

  @Field(() => String)
  productCategory: string;

  @Field(() => ProductStatus)
  productStatus: ProductStatus;

  @Field(() => [String])
  productTags?: [string];

  @Field(() => String)
  productLocation: string;

  @Field(() => String)
  productShippingTime: string;

  @Field(() => String)
  productTitle: string;

  @Field(() => Int)
  productPrice: number;

  @Field(() => Int)
  productViews: number;

  @Field(() => Int)
  productLikes: number;

  @Field(() => Int)
  productComments: number;

  @Field(() => Int)
  productRank: number;

  @Field(() => [String])
  productImages: [string];

  @Field(() => [String])
  productMaterials: [string];

  @Field(() => [String])
  productColor: [string];

  @Field(() => String, { nullable: true })
  productDesc?: string;

  @Field(() => Int, { nullable: true })
  productShippingCost?: number;

  @Field(() => Boolean, { nullable: true })
  productWrapAvailable?: boolean;

  @Field(() => Boolean, { nullable: true })
  productPersonalizable?: boolean;

  @Field(() => Int)
  productStock: number;

  @Field(() => String)
  productSlug: string;

  @Field(() => String)
  memberId: ObjectId;

  @Field(() => Date, { nullable: true })
  soldAt?: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  ///
  @Field(() => Member, { nullable: true })
  memberData?: Member;

  ///aggregation
  @Field(() => [MeLiked], { nullable: true })
  meLiked?: MeLiked[];
}

@ObjectType()
export class Products {
  @Field(() => [Product])
  list: Product[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter: TotalCounter[];
}
