import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderDto {
  @ApiPropertyOptional({
    description: 'Trạng thái đơn hàng',
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'ID thanh toán từ Payments App',
    example: 'payment_uuid',
  })
  @IsOptional()
  @IsString()
  paymentId?: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ giao hàng',
    example: '456 New St, City',
  })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @ApiPropertyOptional({
    description: 'Ghi chú đơn hàng',
    example: 'Cập nhật địa chỉ giao hàng',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
