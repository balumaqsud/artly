import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import {
  ProductStatus,
  ProductType,
  SHippingTimeType,
} from '../../enums/product.enum';

@InputType()
export class ProductUpdate {
  @IsNotEmpty()
  @Field(() => ID)
  _id: string;

  @IsOptional()
  @Field(() => ProductType, { nullable: true })
  productType?: ProductType;

  @IsOptional()
  @Field(() => ProductStatus, { nullable: true })
  productStatus?: ProductStatus;

  @IsOptional()
  @Field(() => String, { nullable: true })
  productCategory?: string;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  productTags?: string[];

  @IsOptional()
  @Field(() => String, { nullable: true })
  productLocation?: string;

  @IsOptional()
  @Field(() => SHippingTimeType, { nullable: true })
  productShippingTime?: SHippingTimeType;

  @IsOptional()
  @Length(3, 100)
  @Field(() => String, { nullable: true })
  productTitle?: string;

  @IsOptional()
  @Min(0)
  @Field(() => Int, { nullable: true })
  productPrice?: number;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  productImages?: string[];

  @IsOptional()
  @Field(() => [String], { nullable: true })
  productMaterials?: string[];

  @IsOptional()
  @Field(() => [String], { nullable: true })
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
  productWrapAvailable?: boolean;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  productPersonalizable?: boolean;

  @IsOptional()
  @Field(() => Int, { nullable: true })
  productStock?: number;

  @IsOptional()
  @Field(() => String, { nullable: true })
  productSlug?: string;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  soldAt?: Date;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  deletedAt?: Date;
}
