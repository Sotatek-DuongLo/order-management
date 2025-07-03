import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from './product.entity';

export enum OrderStatus {
  CREATED = 'created',
  CONFIRMED = 'confirmed',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @ApiProperty({ description: 'ID duy nhất của đơn hàng', example: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID của user', example: 'user123' })
  @Column()
  userId: string;

  @ApiProperty({ description: 'Tổng tiền đơn hàng', example: 150.0 })
  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @ApiProperty({
    description: 'Trạng thái đơn hàng',
    enum: OrderStatus,
    example: OrderStatus.CREATED,
  })
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.CREATED,
  })
  status: OrderStatus;

  @ApiProperty({
    description: 'Danh sách sản phẩm trong đơn hàng',
    example: [{ productId: 'prod1', quantity: 2, price: 75.0 }],
    required: false,
  })
  @Column({ type: 'jsonb', nullable: true })
  items: Product[];

  @ApiProperty({
    description: 'ID thanh toán từ Payments App',
    example: 'payment_uuid',
    required: false,
  })
  @Column({ nullable: true })
  paymentId: string;

  @ApiProperty({
    description: 'Địa chỉ giao hàng',
    example: '123 Main St, City',
    required: false,
  })
  @Column({ nullable: true })
  deliveryAddress: string;

  @ApiProperty({
    description: 'Ghi chú đơn hàng',
    example: 'Giao hàng vào buổi sáng',
    required: false,
  })
  @Column({ nullable: true })
  notes: string;

  @ApiProperty({ description: 'Thời gian tạo đơn hàng' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Thời gian cập nhật đơn hàng' })
  @UpdateDateColumn()
  updatedAt: Date;
}
