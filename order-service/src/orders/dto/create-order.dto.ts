import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from '../entities/product.entity';

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID của user',
    example: 'user123',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Tổng tiền đơn hàng',
    example: 150.0,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiPropertyOptional({
    description: 'Danh sách sản phẩm trong đơn hàng',
    example: [{ productId: 'prod1', quantity: 2, price: 75.0 }],
  })
  @IsArray()
  items?: Product[];

  @ApiPropertyOptional({
    description: 'Địa chỉ giao hàng',
    example: '123 Main St, City',
  })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @ApiPropertyOptional({
    description: 'Ghi chú đơn hàng',
    example: 'Giao hàng vào buổi sáng',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
