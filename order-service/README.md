<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Orders Service

Microservice quản lý đơn hàng được xây dựng với NestJS.

## Tính năng

- **Quản lý đơn hàng**: Tạo, cập nhật, hủy và theo dõi trạng thái đơn hàng
- **Tích hợp thanh toán**: Tự động gọi Payments App khi tạo đơn hàng mới
- **Trạng thái đơn hàng**: created, confirmed, delivered, cancelled
- **Validation**: Kiểm tra dữ liệu đầu vào với class-validator
- **Database**: Sử dụng PostgreSQL với TypeORM

## Cài đặt

```bash
# Cài đặt dependencies
yarn install

# Tạo file .env từ .env.example
cp .env.example .env

# Cấu hình database trong file .env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=orders_db

# Cấu hình Payments API
PAYMENTS_API_URL=http://localhost:3001
```

## Chạy ứng dụng

```bash
# Development mode
yarn start:dev

# Production mode
yarn build
yarn start:prod
```

## API Documentation

Swagger documentation có thể truy cập tại: `http://localhost:3000/docs`

## API Endpoints

### Tạo đơn hàng
```http
POST /api/orders
Content-Type: application/json

{
  "userId": "user123",
  "totalAmount": 150.00,
  "items": [
    {
      "productId": "prod1",
      "quantity": 2,
      "price": 75.00
    }
  ],
  "deliveryAddress": "123 Main St, City",
  "notes": "Giao hàng vào buổi sáng"
}
```

### Lấy danh sách đơn hàng
```http
GET /api/orders
```

### Lấy thông tin đơn hàng
```http
GET /api/orders/:id
```

### Lấy trạng thái đơn hàng
```http
GET /api/orders/:id/status
```

### Lấy đơn hàng theo user
```http
GET /api/orders/user/:userId
```

### Cập nhật đơn hàng
```http
PATCH /api/orders/:id
Content-Type: application/json

{
  "status": "delivered",
  "deliveryAddress": "456 New St, City"
}
```

### Hủy đơn hàng
```http
PATCH /api/orders/:id/cancel
```

### Xóa đơn hàng
```http
DELETE /api/orders/:id
```

### Quản lý sản phẩm

#### Tạo sản phẩm mới
```http
POST /api/products
Content-Type: application/json

{
  "name": "Sản phẩm mới",
  "price": 100.00,
  "description": "Mô tả sản phẩm"
}
```

#### Lấy danh sách sản phẩm
```http
GET /api/products
```

#### Lấy thông tin sản phẩm
```http
GET /api/products/:id
```

#### Cập nhật sản phẩm
```http
PATCH /api/products/:id
Content-Type: application/json

{
  "name": "Tên sản phẩm mới",
  "price": 120.00
}
```

#### Xóa sản phẩm
```http
DELETE /api/products/:id
```

## Trạng thái đơn hàng

- **created**: Đơn hàng mới được tạo
- **confirmed**: Đơn hàng đã được xác nhận (sau khi thanh toán thành công)
- **delivered**: Đơn hàng đã được giao
- **cancelled**: Đơn hàng đã bị hủy

## Tích hợp với Payments App

Khi tạo đơn hàng mới, Orders Service sẽ tự động:

1. Lưu đơn hàng với trạng thái "created"
2. Gọi Payments App để xử lý thanh toán
3. Cập nhật trạng thái đơn hàng thành "confirmed" nếu thanh toán thành công
4. Lưu payment ID vào đơn hàng

## Cấu trúc dự án

```
src/
├── config/
│   └── configuration.ts      # Cấu hình ứng dụng
├── orders/
│   ├── dto/
│   │   ├── create-order.dto.ts
│   │   └── update-order.dto.ts
│   ├── entities/
│   │   └── order.entity.ts
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   └── orders.module.ts
├── payments/
│   └── payments.service.ts   # Service gọi Payments App
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

Bảng `orders`:
- `id`: UUID (Primary Key)
- `userId`: String (ID của user)
- `totalAmount`: Decimal (Tổng tiền đơn hàng)
- `status`: Enum (Trạng thái đơn hàng)
- `items`: JSON (Danh sách sản phẩm)
- `paymentId`: String (ID thanh toán từ Payments App)
- `deliveryAddress`: String (Địa chỉ giao hàng)
- `notes`: String (Ghi chú)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

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
