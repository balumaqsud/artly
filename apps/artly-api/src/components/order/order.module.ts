import { Module } from '@nestjs/common';
import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';
import OrderSchema from '../../schemas/Order.model';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../member/member.module';
import OrderItemsSchema from '../../schemas/OrderItems.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
    MongooseModule.forFeature([
      { name: 'OrderItem', schema: OrderItemsSchema },
    ]),
    AuthModule,
    MemberModule,
  ],
  providers: [OrderResolver, OrderService],
})
export class OrderModule {}
