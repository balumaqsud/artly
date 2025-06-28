import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Length,
  Min,
} from 'class-validator';
import {
  ProductLocation,
  ProductStatus,
  ProductType,
} from '../../enums/product.enum';
import { ObjectId } from 'mongoose';
import { availableOptions, availableProductSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class PropertyInput {
  @IsNotEmpty()
  @Field(() => ProductType)
  productType: ProductType;

  @IsNotEmpty()
  @Field(() => ProductStatus)
  productStatus: ProductStatus;

  @IsNotEmpty()
  @Field(() => ProductLocation)
  propertyLocation: ProductLocation;

  @IsNotEmpty()
  @Field(() => String)
  propertyAddress: string;

  @IsNotEmpty()
  @Field(() => String)
  propertyTitle: string;

  @IsNotEmpty()
  @Field(() => Int)
  propertyPrice: number;

  @IsNotEmpty()
  @Field(() => [String])
  productImages: string[];

  @IsOptional()
  @Length(5, 500)
  @Field(() => String, { nullable: true })
  productDesc?: string;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  productBarter?: string;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  productRent?: string;

  memberId?: ObjectId;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  constructedAt?: Date;
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
export class SquaresRange {
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
  @Field(() => [ProductLocation], { nullable: true })
  locationList?: ProductLocation[];

  @IsOptional()
  @Field(() => [ProductType], { nullable: true })
  typeList?: ProductType[];

  @IsOptional()
  @Field(() => Int, { nullable: true })
  roomsList?: number;

  @IsOptional()
  @Field(() => Int, { nullable: true })
  bedsList?: number;

  @IsOptional()
  @IsIn(availableOptions, { each: true })
  @Field(() => [String], { nullable: true })
  options?: string[];

  @IsOptional()
  @Field(() => PricesRange, { nullable: true })
  pricesRange?: PricesRange;

  @IsOptional()
  @Field(() => PeriodsRange, { nullable: true })
  periodsRange?: PeriodsRange;

  @IsOptional()
  @Field(() => SquaresRange, { nullable: true })
  squaresRange?: SquaresRange;

  @IsOptional()
  @Field(() => String, { nullable: true })
  text?: string;
}

//all properties input
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
}

@InputType()
export class AgentProductInquiry {
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
  @Field(() => [ProductLocation], { nullable: true })
  productLocationList?: ProductLocation[];
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
