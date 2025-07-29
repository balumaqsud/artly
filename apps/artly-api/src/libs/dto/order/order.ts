import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { Product } from '../product/product';
import { OrderStatus } from '../../enums/order.enum';
import { TotalCounter } from '../member/member';

@ObjectType()
export class OrderItem {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => Int)
  itemQuantity: number;

  @Field(() => Int)
  itemPrice: number;

  @Field(() => String)
  orderId: ObjectId;

  @Field(() => String)
  productId: ObjectId;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class Order {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => Int)
  orderTotal: number;

  @Field(() => Int)
  orderDelivery: number;

  @Field(() => OrderStatus)
  orderStatus: OrderStatus;

  @Field(() => String)
  memberId: ObjectId;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  /** Relations / Aggregations **/

  @Field(() => [OrderItem], { nullable: true })
  orderItems?: OrderItem[];

  @Field(() => [Product], { nullable: true })
  productData?: Product[];
}

@ObjectType()
export class Orders {
  @Field(() => [Orders])
  list: Orders[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter: TotalCounter[];
}
