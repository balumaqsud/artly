import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderItem, Orders } from '../../libs/dto/order/order';
import { Model, ObjectId } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import {
  CreateOrderInput,
  OrderInquiry,
  OrderItemInput,
} from '../../libs/dto/order/order.input';
import { lookUpOrders, lookUpProducts, shapeId } from '../../libs/config';
import { Message } from '../../libs/enums/common.enum';
import { OrderStatus } from '../../libs/enums/order.enum';
import { MemberService } from '../member/member.service';
import { OrderUpdateInput } from '../../libs/dto/order/order.update';
import { T } from '../../libs/types/common';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel('Order')
    private readonly orderModel: Model<Order>,
    @InjectModel('OrderItem')
    private readonly orderItemsModel: Model<OrderItem>,
    private readonly memberService: MemberService,
  ) {}

  public async createOrder(
    memberId: ObjectId,
    input: CreateOrderInput,
  ): Promise<Order> {
    const amount = input.items.reduce((total: number, item: OrderItemInput) => {
      return total + item.itemPrice * item.itemQuantity;
    }, 0);
    const delivery = amount <= 100 ? 5 : 0;

    try {
      const newOrder = await this.orderModel.create({
        orderTotal: amount + delivery,
        orderDelivery: delivery,
        memberId: memberId,
      });
      const orderId = shapeId(newOrder._id);
      await this.recordOrderItems(orderId, input);
      return newOrder.toJSON() as Order;
    } catch (error) {
      console.log('orderCreation error:', error);
      throw new InternalServerErrorException(Message.BAD_REQUEST);
    }
  }
  private async recordOrderItems(
    orderId: ObjectId,
    input: CreateOrderInput,
  ): Promise<void> {
    const list = input.items.map(async (item: OrderItemInput) => {
      item.orderId = orderId;
      item.productId = shapeId(item.productId);
      await this.orderItemsModel.create(item);
      return 'recorded';
    });

    const orderItemsState = await Promise.all(list);
    console.log('promised list:', orderItemsState);
  }

  public async getMyOrders(
    memberId: ObjectId,
    input: OrderInquiry,
  ): Promise<Orders> {
    const { orderStatus } = input;
    const matches: T = {
      memberId: memberId,
    };
    if (orderStatus) {
      matches.orderStatus = orderStatus;
    }

    console.log('getMyOrders matches:', matches);
    console.log('getMyOrders input:', input);
    const result = await this.orderModel
      .aggregate([
        { $match: matches },
        { $sort: { updatedAt: -1 } },
        lookUpOrders,
        {
          $lookup: {
            from: 'products',
            localField: 'orderItems.productId',
            foreignField: '_id',
            as: 'productData',
          },
        },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    if (!result || !result[0]) {
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    }

    return result[0];
  }

  public async updateOrder(
    memberId: ObjectId,
    input: OrderUpdateInput,
  ): Promise<Order> {
    const { orderId, orderStatus } = input;
    const id = shapeId(orderId);
    const result = await this.orderModel
      .findOneAndUpdate(
        { memberId: memberId, _id: id },
        { orderStatus: orderStatus },
        { new: true },
      )
      .exec();

    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    if (orderStatus === OrderStatus.CONFIRMED) {
      await this.memberService.memberStatsEditor({
        _id: memberId,
        targetKey: 'memberPoints',
        modifier: 1,
      });
    }
    return result;
  }
}
