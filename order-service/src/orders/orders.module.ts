import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Order } from './entities/order.entity';
import { Product } from './entities/product.entity';
import { PaymentsService } from '../payments/payments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product]), HttpModule],
  controllers: [OrdersController, ProductsController],
  providers: [OrdersService, ProductsService, PaymentsService],
  exports: [OrdersService, ProductsService],
})
export class OrdersModule {}
