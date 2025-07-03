import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  DIGITAL_WALLET = 'digital_wallet',
}

@Entity('payments')
export class Payment {
  @ApiProperty({ description: 'ID duy nhất của thanh toán', example: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID của đơn hàng', example: 'order123' })
  @Column()
  orderId: string;

  @ApiProperty({ description: 'ID của user', example: 'user123' })
  @Column()
  userId: string;

  @ApiProperty({ description: 'Số tiền thanh toán', example: 150.0 })
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({
    description: 'Trạng thái thanh toán',
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @ApiProperty({
    description: 'Phương thức thanh toán',
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD,
    required: false,
  })
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Token xác thực',
    example: 'dummy_token_user123',
    required: false,
  })
  @Column({ nullable: true })
  authToken: string;

  @ApiProperty({
    description: 'Mã PIN',
    example: '1234',
    required: false,
  })
  @Column({ nullable: true })
  pin: string;

  @ApiProperty({
    description: 'ID giao dịch',
    example: 'transaction_uuid',
    required: false,
  })
  @Column({ nullable: true })
  transactionId: string;

  @ApiProperty({
    description: 'Thông báo lỗi',
    example: 'Insufficient funds',
    required: false,
  })
  @Column({ nullable: true })
  errorMessage: string;

  @ApiProperty({
    description: 'Dữ liệu bổ sung',
    example: { processedAt: '2024-01-01T00:00:00Z', source: 'orders_app' },
    required: false,
  })
  @Column({ type: 'json', nullable: true })
  metadata: any;

  @ApiProperty({ description: 'Thời gian tạo thanh toán' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Thời gian cập nhật thanh toán' })
  @UpdateDateColumn()
  updatedAt: Date;
}
