import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Length,
  Min,
} from 'class-validator';
import { ProductStatus, ProductType } from '../../enums/product.enum';
import { ObjectId } from 'mongoose';
import { availableProductSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class ProductInput {
  @IsNotEmpty()
  @Field(() => ProductType)
  productType: ProductType;

  @IsNotEmpty()
  @Field(() => String)
  productCategory: string;

  @IsNotEmpty()
  @Field(() => String)
  productLocation: string;

  @IsNotEmpty()
  @Field(() => String)
  productShippingTime: string;

  @IsNotEmpty()
  @Field(() => String)
  productTitle: string;

  @IsNotEmpty()
  @Min(0)
  @Field(() => Int)
  productPrice: number;

  @IsNotEmpty()
  @Field(() => [String])
  productImages: string[];

  @IsNotEmpty()
  @Field(() => [String])
  productMaterials: string[];

  @IsNotEmpty()
  @Field(() => [String])
  productTags: string[];

  @IsNotEmpty()
  @Field(() => Int)
  productStock: number;

  @IsOptional()
  @Field(() => [String])
  productColor?: string[];

  @IsOptional()
  @Length(5, 500)
  @Field(() => String, { nullable: true })
  productDesc?: string;

  @IsOptional()
  @Min(0)
  @Field(() => Int, { nullable: true })
  productShippingCost?: number;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  productWrapAvailable: boolean;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  productPersonalizable: boolean;

  memberId?: ObjectId;
}

// additional inputs
@InputType()
export class PricesRange {
  @Field(() => Int)
  start: number;

  @Field(() => Int)
  end: number;
}

@InputType()
export class PeriodsRange {
  @Field(() => Date)
  start: Date;

  @Field(() => Date)
  end: Date;
}

//search
@InputType()
class PISearch {
  @IsOptional()
  @Field(() => String, { nullable: true })
  memberId?: ObjectId;

  @IsOptional()
  @Field(() => String, { nullable: true })
  productLocation?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  productTags?: String;

  @IsOptional()
  @Field(() => PricesRange, { nullable: true })
  pricesRange?: PricesRange;

  @IsOptional()
  @Field(() => PeriodsRange, { nullable: true })
  periodsRange?: PeriodsRange;

  @IsOptional()
  @Field(() => [ProductType], { nullable: true })
  typeList?: ProductType[];

  @IsOptional()
  @Field(() => String, { nullable: true })
  text?: string;
}

//all products input
@InputType()
export class ProductsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableProductSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => PISearch)
  search: PISearch;
}

@InputType()
class APISearch {
  @IsOptional()
  @Field(() => ProductStatus, { nullable: true })
  productStatus?: ProductStatus;

  @IsOptional()
  @Field(() => String, { nullable: true })
  productTitle?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  productLocation?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  productCategory?: string;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  productRank?: number;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  productPrice?: number;
}

@InputType()
export class SellerProductsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableProductSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => APISearch)
  search: APISearch;
}

//admin

@InputType()
class ALPISearch {
  @IsOptional()
  @Field(() => ProductStatus, { nullable: true })
  productStatus?: ProductStatus;

  @IsOptional()
  @Field(() => String, { nullable: true })
  productLocation?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  productTitle?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  productCategory?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  productType?: string;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  productPrice?: number;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  productRank?: number;
}

@InputType()
export class AllProductsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableProductSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => ALPISearch)
  search: ALPISearch;
}

@InputType()
export class OrdinaryInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;
}
