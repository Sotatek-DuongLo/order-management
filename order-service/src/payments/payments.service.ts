import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface PaymentRequest {
  orderId: string;
  userId: string;
  amount: number;
  authToken: string;
  pin: string;
}

export interface PaymentResponse {
  paymentId: string;
  status: 'success' | 'failed';
  message?: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly paymentsApiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.paymentsApiUrl = this.configService.get<string>(
      'payments.apiUrl',
      'http://localhost:3001',
    );
  }

  async processPayment(
    paymentRequest: PaymentRequest,
  ): Promise<PaymentResponse> {
    try {
      this.logger.log(
        `Processing payment for order: ${paymentRequest.orderId}`,
      );

      const response = await firstValueFrom(
        this.httpService.post<PaymentResponse>(
          `${this.paymentsApiUrl}/payments/process`,
          {
            orderId: paymentRequest.orderId,
            userId: paymentRequest.userId,
            amount: paymentRequest.amount,
            authToken: paymentRequest.authToken,
            pin: paymentRequest.pin,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.log(
        `Payment processed successfully: ${response.data.paymentId}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to process payment for order ${paymentRequest.orderId}:`,
        error.message,
      );
      throw new Error(`Payment processing failed: ${error.message}`);
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<PaymentResponse>(
          `${this.paymentsApiUrl}/payments/${paymentId}`,
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to get payment status for ${paymentId}:`,
        error.message,
      );
      throw new Error(`Failed to get payment status: ${error.message}`);
    }
  }
}
