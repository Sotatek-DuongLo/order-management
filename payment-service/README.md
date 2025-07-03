# Payments Service

Microservice xử lý thanh toán được xây dựng với NestJS.

## Tính năng

- **Xử lý thanh toán**: Nhận và xử lý yêu cầu thanh toán từ Orders App
- **Logic Mock**: Trả về kết quả ngẫu nhiên để test (80% thành công, 20% thất bại)
- **Trạng thái thanh toán**: pending, success, failed, cancelled
- **Validation**: Kiểm tra dữ liệu đầu vào với class-validator
- **Database**: Sử dụng PostgreSQL với TypeORM
- **Tích hợp**: Tương thích với Orders App

## Logic Mock

Payments Service sử dụng logic mock với các quy tắc:

- **Tỷ lệ thành công**: 80% thành công, 20% thất bại
- **Thanh toán lớn**: Số tiền > 10,000 có tỷ lệ thất bại cao hơn (30%)
- **PIN đặc biệt**: PIN "0000" luôn thất bại
- **Token không hợp lệ**: Token chứa "invalid" luôn thất bại
- **Thông báo lỗi**: Trả về thông báo lỗi ngẫu nhiên khi thất bại

## Cài đặt

```bash
# Cài đặt dependencies
yarn install

# Tạo file .env từ env.example
cp env.example .env

# Cấu hình database trong file .env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=payments_db

# Cấu hình ứng dụng
NODE_ENV=development
PORT=3001
```

## Chạy ứng dụng

```bash
# Development mode
yarn start:dev

# Production mode
yarn build
yarn start:prod
```

## API Endpoints

### Xử lý thanh toán
```http
POST /payments/process
Content-Type: application/json

{
  "orderId": "order123",
  "userId": "user123",
  "amount": 150.00,
  "authToken": "dummy_token_user123",
  "pin": "1234",
  "paymentMethod": "credit_card"
}
```

**Response thành công:**
```json
{
  "paymentId": "uuid",
  "status": "success",
  "message": "Payment processed successfully",
  "transactionId": "uuid"
}
```

**Response thất bại:**
```json
{
  "paymentId": "uuid",
  "status": "failed",
  "message": "Insufficient funds"
}
```

### Lấy danh sách thanh toán
```http
GET /payments
```

### Lấy thông tin thanh toán
```http
GET /payments/:id
```

### Lấy trạng thái thanh toán
```http
GET /payments/:id/status
```

### Lấy thanh toán theo order
```http
GET /payments/order/:orderId
```

### Lấy thanh toán theo user
```http
GET /payments/user/:userId
```

## Trạng thái thanh toán

- **pending**: Thanh toán đang được xử lý
- **success**: Thanh toán thành công
- **failed**: Thanh toán thất bại
- **cancelled**: Thanh toán đã bị hủy

## Phương thức thanh toán

- **credit_card**: Thẻ tín dụng
- **debit_card**: Thẻ ghi nợ
- **bank_transfer**: Chuyển khoản ngân hàng
- **digital_wallet**: Ví điện tử

## Tích hợp với Orders App

Payments Service được thiết kế để tích hợp với Orders App:

1. Orders App gọi `/payments/process` khi tạo đơn hàng mới
2. Payments Service xử lý thanh toán với logic mock
3. Trả về kết quả (success/failed) cho Orders App
4. Orders App cập nhật trạng thái đơn hàng dựa trên kết quả

## Cấu trúc dự án

```
src/
├── config/
│   └── configuration.ts      # Cấu hình ứng dụng
├── payments/
│   ├── dto/
│   │   └── process-payment.dto.ts
│   ├── entities/
│   │   └── payment.entity.ts
│   ├── payments.controller.ts
│   ├── payments.service.ts
│   └── payments.module.ts
├── app.controller.ts
├── app.service.ts
├── app.module.ts
└── main.ts
```

## Testing

```bash
# Unit tests
yarn test

# e2e tests
yarn test:e2e

# Test coverage
yarn test:cov
```

## Database Schema

Bảng `payments`:
- `id`: UUID (Primary Key)
- `orderId`: String (ID của đơn hàng)
- `userId`: String (ID của user)
- `amount`: Decimal (Số tiền thanh toán)
- `status`: Enum (Trạng thái thanh toán)
- `paymentMethod`: Enum (Phương thức thanh toán)
- `authToken`: String (Token xác thực)
- `pin`: String (Mã PIN)
- `transactionId`: String (ID giao dịch)
- `errorMessage`: String (Thông báo lỗi)
- `metadata`: JSON (Dữ liệu bổ sung)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

## Test Cases

### Test thành công
```json
{
  "orderId": "order123",
  "userId": "user123",
  "amount": 150.00,
  "authToken": "dummy_token_user123",
  "pin": "1234"
}
```

### Test thất bại với PIN đặc biệt
```json
{
  "orderId": "order456",
  "userId": "user456",
  "amount": 200.00,
  "authToken": "dummy_token_user456",
  "pin": "0000"
}
```

### Test thất bại với token không hợp lệ
```json
{
  "orderId": "order789",
  "userId": "user789",
  "amount": 100.00,
  "authToken": "invalid_token_user789",
  "pin": "1234"
}
```

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
