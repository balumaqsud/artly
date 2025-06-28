import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import {
  ProductType,
  ProductStatus,
  ProductLocation,
} from '../../enums/product.enum';
import { Member, TotalCounter } from '../member/member';
import { MeLiked } from '../like/like';

@ObjectType()
export class Product {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => ProductType)
  productType: ProductType;

  @Field(() => ProductStatus)
  productStatus: ProductStatus;

  @Field(() => ProductLocation)
  productLocation: ProductLocation;

  @Field(() => String)
  productAddress: string;

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

  @Field(() => String, { nullable: true })
  productDesc?: string;

  @Field(() => String)
  memberId: ObjectId;

  @Field(() => Date, { nullable: true })
  soldAt?: Date;
  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  @Field(() => Date, { nullable: true })
  constructedAt?: Date;

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
