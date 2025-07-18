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
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error processing payment for order ${processPaymentDto.orderId}:`,
        errorMessage,
      );
      throw new Error(`Payment processing failed: ${errorMessage}`);
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

  // Mock payment processing logic - luôn trả về thành công (happy case)
  private mockPaymentProcessing(paymentData: ProcessPaymentDto): boolean {
    // Chỉ thất bại khi PIN là '0000', các trường hợp khác đều thành công
    if (paymentData.pin === '0000') {
      return false;
    }

    // Luôn thành công cho các PIN khác
    return true;
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
