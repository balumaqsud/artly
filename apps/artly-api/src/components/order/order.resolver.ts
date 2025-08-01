import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { OrderService } from './order.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import {
  CreateOrderInput,
  OrderInquiry,
  OrderItemInput,
} from '../../libs/dto/order/order.input';
import { ObjectId } from 'mongoose';
import { Order, Orders } from '../../libs/dto/order/order';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { WithoutGuard } from '../auth/guards/without.guard';
import { OrderUpdateInput } from '../../libs/dto/order/order.update';
import { shapeId } from '../../libs/config';

@Resolver()
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(AuthGuard)
  @Mutation((returns) => Order)
  public async createOrder(
    @Args('input') input: CreateOrderInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Order> {
    console.log('mutation, createOrder');
    return await this.orderService.createOrder(memberId, input);
  }

  @UseGuards(WithoutGuard)
  @Query((returns) => Orders)
  public async getMyOrders(
    @Args('input') input: OrderInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Orders> {
    console.log('query, getMyOrders');
    return await this.orderService.getMyOrders(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => Order)
  public async updateOrder(
    @Args('input') input: OrderUpdateInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Order> {
    console.log('mutation, updateOrder');
    const orderId = shapeId(input.orderId);
    return await this.orderService.updateOrder(memberId, input);
  }
}
