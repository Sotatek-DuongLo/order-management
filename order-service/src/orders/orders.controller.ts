import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UsePipes,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import {
  createApiResponse,
  createPaginatedResponse,
} from '../common/decorators/api-response.decorator';
import {
  ApiResponse as ApiResponseInterface,
  PaginatedResponse,
} from '../common/interfaces/api-response.interface';

@ApiTags('orders')
@Controller('orders')
@UsePipes(new ValidationPipe({ transform: true }))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo đơn hàng mới' })
  @ApiBody({ type: CreateOrderDto })
  @ApiCreatedResponse({
    description: 'Đơn hàng đã được tạo thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Đơn hàng đã được tạo thành công' },
        data: { $ref: '#/components/schemas/Order' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu đầu vào không hợp lệ' })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<ApiResponseInterface<Order>> {
    const order = await this.ordersService.createOrder(createOrderDto);
    return createApiResponse(order, 'Đơn hàng đã được tạo thành công');
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả đơn hàng' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Trang hiện tại',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng item mỗi trang',
    example: 10,
  })
  @ApiOkResponse({
    description: 'Danh sách đơn hàng',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách đơn hàng thành công',
        },
        data: { type: 'array', items: { $ref: '#/components/schemas/Order' } },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 50 },
            totalPages: { type: 'number', example: 5 },
            hasNext: { type: 'boolean', example: true },
            hasPrev: { type: 'boolean', example: false },
          },
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<PaginatedResponse<Order>> {
    const { orders, total } = await this.ordersService.findAllPaginated(
      page,
      limit,
    );
    return createPaginatedResponse(
      orders,
      page,
      limit,
      total,
      'Lấy danh sách đơn hàng thành công',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin đơn hàng theo ID' })
  @ApiParam({ name: 'id', description: 'ID của đơn hàng', example: 'uuid' })
  @ApiOkResponse({
    description: 'Thông tin đơn hàng',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy thông tin đơn hàng thành công',
        },
        data: { $ref: '#/components/schemas/Order' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy đơn hàng' })
  async findOne(@Param('id') id: string): Promise<ApiResponseInterface<Order>> {
    const order = await this.ordersService.findOne(id);
    return createApiResponse(order, 'Lấy thông tin đơn hàng thành công');
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng theo user' })
  @ApiParam({ name: 'userId', description: 'ID của user', example: 'user123' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Trang hiện tại',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng item mỗi trang',
    example: 10,
  })
  @ApiOkResponse({
    description: 'Danh sách đơn hàng của user',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách đơn hàng của user thành công',
        },
        data: { type: 'array', items: { $ref: '#/components/schemas/Order' } },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 25 },
            totalPages: { type: 'number', example: 3 },
            hasNext: { type: 'boolean', example: true },
            hasPrev: { type: 'boolean', example: false },
          },
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async findByUserId(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<PaginatedResponse<Order>> {
    const { orders, total } = await this.ordersService.findByUserIdPaginated(
      userId,
      page,
      limit,
    );
    return createPaginatedResponse(
      orders,
      page,
      limit,
      total,
      'Lấy danh sách đơn hàng của user thành công',
    );
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Lấy trạng thái đơn hàng' })
  @ApiParam({ name: 'id', description: 'ID của đơn hàng', example: 'uuid' })
  @ApiOkResponse({
    description: 'Trạng thái đơn hàng',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy trạng thái đơn hàng thành công',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            status: {
              type: 'string',
              enum: Object.values(OrderStatus),
              example: OrderStatus.CREATED,
            },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy đơn hàng' })
  async getOrderStatus(
    @Param('id') id: string,
  ): Promise<
    ApiResponseInterface<{ id: string; status: OrderStatus; updatedAt: Date }>
  > {
    const status = await this.ordersService.getOrderStatus(id);
    return createApiResponse(status, 'Lấy trạng thái đơn hàng thành công');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật đơn hàng' })
  @ApiParam({ name: 'id', description: 'ID của đơn hàng', example: 'uuid' })
  @ApiBody({ type: UpdateOrderDto })
  @ApiOkResponse({
    description: 'Đơn hàng đã được cập nhật',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Cập nhật đơn hàng thành công' },
        data: { $ref: '#/components/schemas/Order' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy đơn hàng' })
  @ApiBadRequestResponse({ description: 'Dữ liệu cập nhật không hợp lệ' })
  async updateOrder(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<ApiResponseInterface<Order>> {
    const order = await this.ordersService.updateOrder(id, updateOrderDto);
    return createApiResponse(order, 'Cập nhật đơn hàng thành công');
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hủy đơn hàng' })
  @ApiParam({ name: 'id', description: 'ID của đơn hàng', example: 'uuid' })
  @ApiOkResponse({
    description: 'Đơn hàng đã được hủy',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Hủy đơn hàng thành công' },
        data: { $ref: '#/components/schemas/Order' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy đơn hàng' })
  @ApiBadRequestResponse({ description: 'Không thể hủy đơn hàng' })
  async cancelOrder(
    @Param('id') id: string,
  ): Promise<ApiResponseInterface<Order>> {
    const order = await this.ordersService.cancelOrder(id);
    return createApiResponse(order, 'Hủy đơn hàng thành công');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa đơn hàng' })
  @ApiParam({ name: 'id', description: 'ID của đơn hàng', example: 'uuid' })
  @ApiOkResponse({
    description: 'Đơn hàng đã được xóa',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Xóa đơn hàng thành công' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy đơn hàng' })
  async remove(@Param('id') id: string): Promise<ApiResponseInterface<null>> {
    await this.ordersService.remove(id);
    return createApiResponse(null, 'Xóa đơn hàng thành công');
  }
}
