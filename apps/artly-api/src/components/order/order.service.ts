import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderItem, Orders } from '../../libs/dto/order/order';
import { Model, ObjectId } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import { OrderInquiry, OrderItemInput } from '../../libs/dto/order/order.input';
import { shapeId } from '../../libs/config';
import { Message } from '../../libs/enums/common.enum';
import { OrderStatus } from '../../libs/enums/order.enum';
import { MemberService } from '../member/member.service';
import { OrderUpdateInput } from '../../libs/dto/order/order.update';

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
    input: OrderItemInput[],
  ): Promise<Order> {
    const amount = input.reduce((total: number, item: OrderItemInput) => {
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
    input: OrderItemInput[],
  ): Promise<void> {
    const list = input.map(async (item: OrderItemInput) => {
      item.orderId = orderId;
      item.productId = shapeId(item.productId);
      await this.orderItemsModel.create(item);
      return 'inserted';
    });

    const orderItemsState = await Promise.all(list);
    console.log('promised list:', orderItemsState);
  }

  public async getMyOrders(
    memberId: ObjectId,
    inquiry: OrderInquiry,
  ): Promise<Orders> {
    // const memberId = shapeId(member._id);
    const matches = {
      memberId: memberId,
      orderStatus: inquiry.orderStatus,
    };
    const result = await this.orderModel
      .aggregate([
        { $match: matches },
        { $sort: { updatedAt: -1 } },
        { $skip: (inquiry.page - 1) * inquiry.limit },
        { $limit: inquiry.limit },
        {
          $lookup: {
            from: 'orderItems',
            localField: '_id',
            foreignField: 'orderId',
            as: 'orderItems',
          },
        },
        {
          $lookup: {
            from: 'products',
            localField: 'orderItems.productId', //123
            foreignField: '_id', //123
            as: 'productData',
          },
        },
      ])
      .exec();

    if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result[0];
  }

  public async updateOrder(
    memberId: ObjectId,
    input: OrderUpdateInput,
  ): Promise<Order> {
    const orderStatus = input.orderStatus;
    const result = await this.orderModel
      .findOneAndUpdate(
        { memberId: memberId, _id: input.orderId },
        { orderStatus: orderStatus },
        { new: true },
      )
      .exec();

    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    if (orderStatus === OrderStatus.FINISH) {
      await this.memberService.memberStatsEditor({
        _id: memberId,
        targetKey: 'memberPoints',
        modifier: 1,
      });
    }
    return result;
  }
}
