import { Field, InputType, Int } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { OrderStatus } from '../../enums/order.enum';

@InputType()
export class OrderItemInput {
  @Field(() => Int)
  itemQuantity: number;

  @Field(() => Int)
  itemPrice: number;

  @Field(() => String)
  productId: ObjectId;

  @Field(() => String, { nullable: true })
  orderId?: ObjectId;
}

@InputType()
export class CreateOrderInput {
  @Field(() => [OrderItemInput])
  items: OrderItemInput[];
}

@InputType()
export class OrderInquiry {
  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => OrderStatus)
  orderStatus: OrderStatus;
}
