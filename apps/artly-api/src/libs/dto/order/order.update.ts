import { Field, InputType } from '@nestjs/graphql';
import { OrderStatus } from '../../enums/order.enum';

@InputType()
export class OrderUpdateInput {
  @Field(() => String)
  orderId: string;

  @Field(() => OrderStatus)
  orderStatus: OrderStatus;
}
