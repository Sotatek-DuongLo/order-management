import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProcessPaymentDto {
  @ApiProperty({
    description: 'ID của đơn hàng',
    example: 'order123',
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({
    description: 'ID của user',
    example: 'user123',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Số tiền thanh toán',
    example: 150.0,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Token xác thực',
    example: 'dummy_token_user123',
  })
  @IsNotEmpty()
  @IsString()
  authToken: string;

  @ApiProperty({
    description: 'Mã PIN',
    example: '1234',
  })
  @IsNotEmpty()
  @IsString()
  pin: string;

  @ApiPropertyOptional({
    description: 'Phương thức thanh toán',
    example: 'credit_card',
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet'],
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
