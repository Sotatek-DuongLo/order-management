import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('products')
export class Product {
  @ApiProperty({
    description: 'ID duy nhất của sản phẩm',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Tên sản phẩm',
    example: 'iPhone 15 Pro',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Giá sản phẩm (VND)',
    example: 25000000,
  })
  @Column()
  price: number;

  @ApiProperty({
    description: 'Mô tả chi tiết về sản phẩm',
    example: 'iPhone 15 Pro với chip A17 Pro mạnh mẽ, camera 48MP',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string;
}
