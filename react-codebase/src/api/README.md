# API Documentation

## Order Service API

### Orders

#### Lấy danh sách đơn hàng
```typescript
import ApiOrder from '@/api/ApiOrder';

const orders = await ApiOrder.getOrders();
```

#### Lấy đơn hàng theo ID
```typescript
const order = await ApiOrder.getOrderById('order-id');
```

#### Tạo đơn hàng mới
```typescript
const newOrder = await ApiOrder.createOrder({
  userId: 'user123',
  totalAmount: 150.00,
  items: [
    {
      productId: 'prod1',
      quantity: 2,
      price: 75.00
    }
  ],
  deliveryAddress: '123 Main St, City',
  notes: 'Giao hàng vào buổi sáng'
});
```

#### Cập nhật đơn hàng
```typescript
const updatedOrder = await ApiOrder.updateOrder('order-id', {
  status: 'delivered',
  deliveryAddress: '456 New St, City'
});
```

#### Hủy đơn hàng
```typescript
const cancelledOrder = await ApiOrder.cancelOrder('order-id');
```

#### Xóa đơn hàng
```typescript
await ApiOrder.deleteOrder('order-id');
```

#### Lấy trạng thái đơn hàng
```typescript
const orderStatus = await ApiOrder.getOrderStatus('order-id');
```

#### Lấy đơn hàng theo user
```typescript
const userOrders = await ApiOrder.getOrdersByUser('user123');
```

### Products

#### Lấy danh sách sản phẩm
```typescript
const products = await ApiOrder.getProducts();
```

#### Lấy sản phẩm theo ID
```typescript
const product = await ApiOrder.getProductById(1);
```

#### Tạo sản phẩm mới
```typescript
const newProduct = await ApiOrder.createProduct({
  name: 'Sản phẩm mới',
  price: 100.00,
  description: 'Mô tả sản phẩm'
});
```

#### Cập nhật sản phẩm
```typescript
const updatedProduct = await ApiOrder.updateProduct(1, {
  name: 'Tên sản phẩm mới',
  price: 120.00
});
```

#### Xóa sản phẩm
```typescript
await ApiOrder.deleteProduct(1);
```

## Payment Service API

### Payments

#### Xử lý thanh toán
```typescript
const paymentResult = await ApiOrder.processPayment({
  orderId: 'order123',
  userId: 'user123',
  amount: 150.00,
  authToken: 'auth-token',
  pin: '123456'
});
```

#### Lấy danh sách thanh toán
```typescript
const payments = await ApiOrder.getPayments();
```

#### Lấy thanh toán theo ID
```typescript
const payment = await ApiOrder.getPaymentById('payment-id');
```

#### Lấy trạng thái thanh toán
```typescript
const paymentStatus = await ApiOrder.getPaymentStatus('payment-id');
```

#### Lấy thanh toán theo đơn hàng
```typescript
const orderPayments = await ApiOrder.getPaymentsByOrder('order123');
```

#### Lấy thanh toán theo user
```typescript
const userPayments = await ApiOrder.getPaymentsByUser('user123');
```

## Types

### Order Types
- `IOrder`: Interface cho đơn hàng
- `ICreateOrderDto`: Interface cho dữ liệu tạo đơn hàng
- `IUpdateOrderDto`: Interface cho dữ liệu cập nhật đơn hàng
- `IOrderStatus`: Interface cho trạng thái đơn hàng

### Product Types
- `IProduct`: Interface cho sản phẩm
- `ICreateProductDto`: Interface cho dữ liệu tạo sản phẩm
- `IUpdateProductDto`: Interface cho dữ liệu cập nhật sản phẩm

### Payment Types
- `IPayment`: Interface cho thanh toán
- `IProcessPaymentDto`: Interface cho dữ liệu xử lý thanh toán
- `IPaymentResponse`: Interface cho kết quả thanh toán

## Error Handling

Tất cả các API functions đều sử dụng `fetcher` utility, nó sẽ tự động xử lý lỗi và hiển thị thông báo lỗi cho người dùng.

```typescript
try {
  const orders = await ApiOrder.getOrders();
  // Xử lý dữ liệu thành công
} catch (error) {
  // Lỗi đã được xử lý tự động bởi fetcher
  console.error('Error fetching orders:', error);
}
```

## Base URLs

- **Order Service**: `http://localhost:3000/api`
- **Payment Service**: `http://localhost:3001/api`

## Swagger Documentation

- **Order Service**: `http://localhost:3000/docs`
- **Payment Service**: `http://localhost:3001/docs` 