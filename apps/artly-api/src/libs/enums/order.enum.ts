export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

import { registerEnumType } from '@nestjs/graphql';

registerEnumType(OrderStatus, {
  name: 'OrderStatus', // must match usage in @Field(() => OrderStatus)
});
