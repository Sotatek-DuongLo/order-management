import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  Payment,
  PaymentStatus,
  PaymentMethod,
} from './entities/payment.entity';
import { ProcessPaymentDto } from './dto/process-payment.dto';

export interface PaymentResponse {
  paymentId: string;
  status: 'success' | 'failed';
  message?: string;
  transactionId?: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async processPayment(
    processPaymentDto: ProcessPaymentDto,
  ): Promise<PaymentResponse> {
    try {
      this.logger.log(
        `Processing payment for order: ${processPaymentDto.orderId}`,
      );

      // Tạo payment record
      const payment = this.paymentRepository.create({
        orderId: processPaymentDto.orderId,
        userId: processPaymentDto.userId,
        amount: processPaymentDto.amount,
        authToken: processPaymentDto.authToken,
        pin: processPaymentDto.pin,
        paymentMethod:
          (processPaymentDto.paymentMethod as PaymentMethod) ||
          PaymentMethod.CREDIT_CARD,
        status: PaymentStatus.PENDING,
        metadata: {
          processedAt: new Date().toISOString(),
          source: 'orders_app',
        },
      });

      const savedPayment = await this.paymentRepository.save(payment);

      // Mock payment processing logic
      const isSuccess = this.mockPaymentProcessing(processPaymentDto);

      if (isSuccess) {
        // Payment thành công
        const transactionId = uuidv4();
        await this.paymentRepository.update(savedPayment.id, {
          status: PaymentStatus.SUCCESS,
          transactionId,
          metadata: {
            ...savedPayment.metadata,
            successAt: new Date().toISOString(),
            transactionId,
          },
        });

        this.logger.log(
          `Payment successful for order ${processPaymentDto.orderId}, transaction: ${transactionId}`,
        );

        return {
          paymentId: savedPayment.id,
          status: 'success',
          message: 'Payment processed successfully',
          transactionId,
        };
      } else {
        // Payment thất bại
        const errorMessage = this.getRandomErrorMessage();
        await this.paymentRepository.update(savedPayment.id, {
          status: PaymentStatus.FAILED,
          errorMessage,
          metadata: {
            ...savedPayment.metadata,
            failedAt: new Date().toISOString(),
            errorMessage,
          },
        });

        this.logger.warn(
          `Payment failed for order ${processPaymentDto.orderId}: ${errorMessage}`,
        );

        return {
          paymentId: savedPayment.id,
          status: 'failed',
          message: errorMessage,
        };
      }
    } catch (error) {
      this.logger.error(
        `Error processing payment for order ${processPaymentDto.orderId}:`,
        error.message,
      );
      throw new Error(`Payment processing failed: ${error.message}`);
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    return {
      paymentId: payment.id,
      status: payment.status === PaymentStatus.SUCCESS ? 'success' : 'failed',
      message: payment.errorMessage || 'Payment processed successfully',
      transactionId: payment.transactionId,
    };
  }

  async getPaymentById(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    return payment;
  }

  async getPaymentsByOrderId(orderId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllPayments(): Promise<Payment[]> {
    return this.paymentRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // Mock payment processing logic - trả về kết quả ngẫu nhiên
  private mockPaymentProcessing(paymentData: ProcessPaymentDto): boolean {
    // Logic mock: 80% thành công, 20% thất bại
    const successRate = 0.8;
    const random = Math.random();

    // Thêm một số điều kiện đặc biệt để test
    if (paymentData.amount > 10000) {
      // Thanh toán lớn hơn 10,000 có tỷ lệ thất bại cao hơn
      return Math.random() < 0.3;
    }

    if (paymentData.pin === '0000') {
      // PIN 0000 luôn thất bại
      return false;
    }

    if (paymentData.authToken.includes('invalid')) {
      // Token không hợp lệ
      return false;
    }

    return random < successRate;
  }

  // Lấy thông báo lỗi ngẫu nhiên
  private getRandomErrorMessage(): string {
    const errorMessages = [
      'Insufficient funds',
      'Invalid card number',
      'Card expired',
      'Transaction declined by bank',
      'Network timeout',
      'Invalid PIN',
      'Daily limit exceeded',
      'Card blocked',
      'Invalid authentication',
      'System error',
    ];

    const randomIndex = Math.floor(Math.random() * errorMessages.length);
    return errorMessages[randomIndex];
  }
}
