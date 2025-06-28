import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProductService } from './product.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { Product, Products } from '../../libs/dto/product/product';
import {
  ProductInput,
  ProductsInquiry,
  SellerProductsInquiry,
} from '../../libs/dto/product/product.input';
import { ObjectId } from 'mongoose';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ProductUpdate } from '../../libs/dto/product/product.update';
import { shapeId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';

@Resolver()
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  //createProduct
  @Roles(MemberType.SELLER)
  @UseGuards(RolesGuard)
  @Mutation(() => Product)
  public async createProduct(
    @Args('input') input: ProductInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Product> {
    console.log('mutation: createProduct');
    input.memberId = memberId;
    return await this.productService.createProduct(input);
  }

  //getProperty
  @UseGuards(WithoutGuard)
  @Query(() => Product)
  public async getProduct(
    @Args('productId') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Product> {
    console.log('mutation: getProduct');
    const productId = shapeId(input);
    return await this.productService.getProduct(memberId, productId);
  }

  //update Property
  @Roles(MemberType.SELLER)
  @UseGuards(RolesGuard)
  @Mutation(() => Product)
  public async updateProduct(
    @Args('input') input: ProductUpdate,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Product> {
    console.log('mutation: updateProduct');
    input._id = shapeId(input._id);
    return await this.productService.updateProduct(memberId, input);
  }

  //getALlProduct
  @UseGuards(WithoutGuard)
  @Query((returns) => Products)
  public async getProducts(
    @Args('input') input: ProductsInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Products> {
    console.log('query: getProducts');
    return await this.productService.getProducts(memberId, input);
  }

  //getProducts
  @Roles(MemberType.SELLER)
  @UseGuards(RolesGuard)
  @Query((returns) => Products)
  public async getSellerProducts(
    @Args('input') input: SellerProductsInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Products> {
    console.log('query: getSellerProducts');
    return await this.productService.getSellerProducts(memberId, input);
  }
}
