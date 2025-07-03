import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ValidationPipe,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { PaymentsService, PaymentResponse } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { Payment } from './entities/payment.entity';

@ApiTags('payments')
@Controller('payments')
@UsePipes(new ValidationPipe({ transform: true }))
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('process')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xử lý thanh toán' })
  @ApiBody({ type: ProcessPaymentDto })
  @ApiOkResponse({
    description: 'Kết quả xử lý thanh toán',
    schema: {
      type: 'object',
      properties: {
        paymentId: { type: 'string', example: 'uuid' },
        status: {
          type: 'string',
          enum: ['success', 'failed'],
          example: 'success',
        },
        message: { type: 'string', example: 'Payment processed successfully' },
        transactionId: { type: 'string', example: 'transaction_uuid' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu đầu vào không hợp lệ' })
  async processPayment(
    @Body() processPaymentDto: ProcessPaymentDto,
  ): Promise<PaymentResponse> {
    return this.paymentsService.processPayment(processPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả thanh toán' })
  @ApiOkResponse({
    description: 'Danh sách thanh toán',
    type: [Payment],
  })
  async getAllPayments(): Promise<Payment[]> {
    return this.paymentsService.getAllPayments();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin thanh toán theo ID' })
  @ApiParam({ name: 'id', description: 'ID của thanh toán', example: 'uuid' })
  @ApiOkResponse({
    description: 'Thông tin thanh toán',
    type: Payment,
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy thanh toán' })
  async getPaymentById(@Param('id') id: string): Promise<Payment> {
    return this.paymentsService.getPaymentById(id);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Lấy trạng thái thanh toán' })
  @ApiParam({ name: 'id', description: 'ID của thanh toán', example: 'uuid' })
  @ApiOkResponse({
    description: 'Trạng thái thanh toán',
    schema: {
      type: 'object',
      properties: {
        paymentId: { type: 'string', example: 'uuid' },
        status: {
          type: 'string',
          enum: ['success', 'failed'],
          example: 'success',
        },
        message: { type: 'string', example: 'Payment processed successfully' },
        transactionId: { type: 'string', example: 'transaction_uuid' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy thanh toán' })
  async getPaymentStatus(@Param('id') id: string): Promise<PaymentResponse> {
    return this.paymentsService.getPaymentStatus(id);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Lấy danh sách thanh toán theo order' })
  @ApiParam({
    name: 'orderId',
    description: 'ID của đơn hàng',
    example: 'order123',
  })
  @ApiOkResponse({
    description: 'Danh sách thanh toán của đơn hàng',
    type: [Payment],
  })
  async getPaymentsByOrderId(
    @Param('orderId') orderId: string,
  ): Promise<Payment[]> {
    return this.paymentsService.getPaymentsByOrderId(orderId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Lấy danh sách thanh toán theo user' })
  @ApiParam({ name: 'userId', description: 'ID của user', example: 'user123' })
  @ApiOkResponse({
    description: 'Danh sách thanh toán của user',
    type: [Payment],
  })
  async getPaymentsByUserId(
    @Param('userId') userId: string,
  ): Promise<Payment[]> {
    return this.paymentsService.getPaymentsByUserId(userId);
  }
}
