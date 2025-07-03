import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Tên sản phẩm',
    example: 'iPhone 15 Pro',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Giá sản phẩm (VND)',
    example: 25000000,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Mô tả chi tiết về sản phẩm',
    example: 'iPhone 15 Pro với chip A17 Pro mạnh mẽ, camera 48MP',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
