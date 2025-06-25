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
export class Property {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => ProductType)
  propertyType: ProductType;

  @Field(() => ProductStatus)
  propertyStatus: ProductStatus;

  @Field(() => ProductLocation)
  propertyLocation: ProductLocation;

  @Field(() => String)
  propertyAddress: string;

  @Field(() => String)
  propertyTitle: string;

  @Field(() => Int)
  propertyPrice: number;

  @Field(() => Int)
  propertyViews: number;

  @Field(() => Int)
  propertyLikes: number;

  @Field(() => Int)
  propertyComments: number;

  @Field(() => Int)
  propertyRank: number;

  @Field(() => [String])
  propertyImages: [string];

  @Field(() => String, { nullable: true })
  propertyDesc?: string;

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
export class Properties {
  @Field(() => [Property])
  list: Property[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter: TotalCounter[];
}
