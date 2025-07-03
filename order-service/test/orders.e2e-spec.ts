import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/orders (POST) - should create a new order', () => {
    const createOrderDto = {
      userId: 'user123',
      totalAmount: 150.0,
      items: [
        {
          productId: 'prod1',
          quantity: 2,
          price: 75.0,
        },
      ],
      deliveryAddress: '123 Main St, City',
      notes: 'Giao hàng vào buổi sáng',
    };

    return request(app.getHttpServer())
      .post('/api/orders')
      .send(createOrderDto)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.userId).toBe(createOrderDto.userId);
        expect(res.body.totalAmount).toBe(createOrderDto.totalAmount);
        expect(res.body.status).toBe('created');
      });
  });

  it('/api/orders (GET) - should return all orders', () => {
    return request(app.getHttpServer())
      .get('/api/orders')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/api/orders/:id (GET) - should return a specific order', async () => {
    // First create an order
    const createOrderDto = {
      userId: 'user456',
      totalAmount: 200.0,
      items: [],
    };

    const createResponse = await request(app.getHttpServer())
      .post('/api/orders')
      .send(createOrderDto)
      .expect(201);

    const orderId = createResponse.body.id;

    // Then get the order
    return request(app.getHttpServer())
      .get(`/api/orders/${orderId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(orderId);
        expect(res.body.userId).toBe(createOrderDto.userId);
      });
  });

  it('/api/orders/:id/status (GET) - should return order status', async () => {
    // First create an order
    const createOrderDto = {
      userId: 'user789',
      totalAmount: 100.0,
      items: [],
    };

    const createResponse = await request(app.getHttpServer())
      .post('/api/orders')
      .send(createOrderDto)
      .expect(201);

    const orderId = createResponse.body.id;

    // Then get the order status
    return request(app.getHttpServer())
      .get(`/api/orders/${orderId}/status`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('status');
        expect(res.body).toHaveProperty('updatedAt');
        expect(res.body.id).toBe(orderId);
      });
  });

  it('/api/orders/:id/cancel (PATCH) - should cancel an order', async () => {
    // First create an order
    const createOrderDto = {
      userId: 'user101',
      totalAmount: 75.0,
      items: [],
    };

    const createResponse = await request(app.getHttpServer())
      .post('/api/orders')
      .send(createOrderDto)
      .expect(201);

    const orderId = createResponse.body.id;

    // Then cancel the order
    return request(app.getHttpServer())
      .patch(`/api/orders/${orderId}/cancel`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(orderId);
        expect(res.body.status).toBe('cancelled');
      });
  });

  it('/api/orders/user/:userId (GET) - should return orders for a specific user', async () => {
    const userId = 'user202';

    // Create multiple orders for the same user
    const createOrderDto1 = {
      userId,
      totalAmount: 50.0,
      items: [],
    };

    const createOrderDto2 = {
      userId,
      totalAmount: 75.0,
      items: [],
    };

    await request(app.getHttpServer())
      .post('/api/orders')
      .send(createOrderDto1)
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/orders')
      .send(createOrderDto2)
      .expect(201);

    // Get orders for the user
    return request(app.getHttpServer())
      .get(`/api/orders/user/${userId}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
        res.body.forEach((order: any) => {
          expect(order.userId).toBe(userId);
        });
      });
  });
});
