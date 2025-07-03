import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private readonly AUTO_DELIVERY_DELAY = 30000; // 30 seconds

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly paymentsService: PaymentsService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      // Tạo order mới
      const order = this.orderRepository.create({
        ...createOrderDto,
        status: OrderStatus.CREATED,
      });

      const savedOrder = await this.orderRepository.save(order);

      // Gọi Payments App để xử lý thanh toán
      try {
        const paymentResponse = await this.paymentsService.processPayment({
          orderId: savedOrder.id,
          userId: savedOrder.userId,
          amount: savedOrder.totalAmount,
          authToken: `dummy_token_${savedOrder.userId}`, // Dummy token
          pin: '1111', // Sử dụng PIN khác '0000' để đảm bảo thành công
        });

        // Cập nhật order dựa trên kết quả payment
        if (paymentResponse.status === 'success') {
          await this.updateOrder(savedOrder.id, {
            paymentId: paymentResponse.paymentId,
            status: OrderStatus.CONFIRMED,
          });

          // Lên lịch auto-delivery sau X giây
          this.scheduleAutoDelivery(savedOrder.id);

          this.logger.log(
            `Order ${savedOrder.id} confirmed, scheduled for auto-delivery in ${this.AUTO_DELIVERY_DELAY}ms`,
          );
        } else {
          // Payment declined ⇒ chuyển order về CANCELLED
          await this.updateOrder(savedOrder.id, {
            status: OrderStatus.CANCELLED,
          });

          this.logger.warn(
            `Payment failed for order ${savedOrder.id}: ${paymentResponse.message}. Order cancelled.`,
          );
        }
      } catch (paymentError) {
        this.logger.error(
          `Payment processing error for order ${savedOrder.id}:`,
          (paymentError as Error).message,
        );

        // Lỗi khi gọi payment service ⇒ chuyển order về CANCELLED
        await this.updateOrder(savedOrder.id, {
          status: OrderStatus.CANCELLED,
        });
      }

      return await this.findOne(savedOrder.id);
    } catch (error) {
      this.logger.error('Error creating order:', (error as Error).message);
      throw new BadRequestException('Failed to create order');
    }
  }

  // Lên lịch tự động chuyển order từ CONFIRMED sang DELIVERED
  private scheduleAutoDelivery(orderId: string): void {
    setTimeout(() => {
      void this.performAutoDelivery(orderId);
    }, this.AUTO_DELIVERY_DELAY);
  }

  private async performAutoDelivery(orderId: string): Promise<void> {
    try {
      const order = await this.findOne(orderId);

      // Chỉ chuyển nếu order vẫn ở trạng thái CONFIRMED
      if (order.status === OrderStatus.CONFIRMED) {
        await this.updateOrder(orderId, {
          status: OrderStatus.DELIVERED,
        });

        this.logger.log(`Order ${orderId} automatically delivered`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to auto-deliver order ${orderId}:`,
        (error as Error).message,
      );
    }
  }

  // Cron job để check và auto-deliver các order CONFIRMED cũ (backup)
  @Cron(CronExpression.EVERY_MINUTE)
  async handleAutoDelivery(): Promise<void> {
    const cutoffTime = new Date(Date.now() - this.AUTO_DELIVERY_DELAY);

    try {
      const confirmedOrders = await this.orderRepository
        .createQueryBuilder('order')
        .where('order.status = :status', { status: OrderStatus.CONFIRMED })
        .andWhere('order.updatedAt < :cutoff', { cutoff: cutoffTime })
        .getMany();

      for (const order of confirmedOrders) {
        await this.updateOrder(order.id, {
          status: OrderStatus.DELIVERED,
        });

        this.logger.log(`Order ${order.id} auto-delivered via cron job`);
      }

      if (confirmedOrders.length > 0) {
        this.logger.log(
          `Auto-delivered ${confirmedOrders.length} orders via cron job`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Error in auto-delivery cron job:',
        (error as Error).message,
      );
    }
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ orders: Order[]; total: number }> {
    const skip = (page - 1) * limit;

    const [orders, total] = await this.orderRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { orders, total };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserIdPaginated(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ orders: Order[]; total: number }> {
    const skip = (page - 1) * limit;

    const [orders, total] = await this.orderRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { orders, total };
  }

  async updateOrder(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    const order = await this.findOne(id);

    // Kiểm tra logic business
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a cancelled order');
    }

    if (
      order.status === OrderStatus.DELIVERED &&
      updateOrderDto.status !== OrderStatus.DELIVERED
    ) {
      throw new BadRequestException(
        'Cannot change status of a delivered order',
      );
    }

    Object.assign(order, updateOrderDto);
    return this.orderRepository.save(order);
  }

  async cancelOrder(id: string): Promise<Order> {
    const order = await this.findOne(id);

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel a delivered order');
    }

    order.status = OrderStatus.CANCELLED;
    return this.orderRepository.save(order);
  }

  async getOrderStatus(
    id: string,
  ): Promise<{ id: string; status: OrderStatus; updatedAt: Date }> {
    const order = await this.findOne(id);
    return {
      id: order.id,
      status: order.status,
      updatedAt: order.updatedAt,
    };
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }
}
