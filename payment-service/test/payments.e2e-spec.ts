import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('PaymentsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/payments/process (POST) - should process a payment', () => {
    const processPaymentDto = {
      orderId: 'order123',
      userId: 'user123',
      amount: 150.0,
      authToken: 'dummy_token_user123',
      pin: '1234',
      paymentMethod: 'credit_card',
    };

    return request(app.getHttpServer())
      .post('/payments/process')
      .send(processPaymentDto)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('paymentId');
        expect(res.body).toHaveProperty('status');
        expect(['success', 'failed']).toContain(res.body.status);
        if (res.body.status === 'success') {
          expect(res.body).toHaveProperty('transactionId');
        }
      });
  });

  it('/payments/process (POST) - should fail with invalid PIN', () => {
    const processPaymentDto = {
      orderId: 'order456',
      userId: 'user456',
      amount: 200.0,
      authToken: 'dummy_token_user456',
      pin: '0000', // PIN này sẽ luôn thất bại
      paymentMethod: 'credit_card',
    };

    return request(app.getHttpServer())
      .post('/payments/process')
      .send(processPaymentDto)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('paymentId');
        expect(res.body.status).toBe('failed');
        expect(res.body).toHaveProperty('message');
      });
  });

  it('/payments/process (POST) - should fail with invalid token', () => {
    const processPaymentDto = {
      orderId: 'order789',
      userId: 'user789',
      amount: 100.0,
      authToken: 'invalid_token_user789', // Token này sẽ thất bại
      pin: '1234',
      paymentMethod: 'credit_card',
    };

    return request(app.getHttpServer())
      .post('/payments/process')
      .send(processPaymentDto)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('paymentId');
        expect(res.body.status).toBe('failed');
        expect(res.body).toHaveProperty('message');
      });
  });

  it('/payments (GET) - should return all payments', () => {
    return request(app.getHttpServer())
      .get('/payments')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/payments/:id (GET) - should return a specific payment', async () => {
    // First process a payment
    const processPaymentDto = {
      orderId: 'order101',
      userId: 'user101',
      amount: 75.0,
      authToken: 'dummy_token_user101',
      pin: '1234',
    };

    const processResponse = await request(app.getHttpServer())
      .post('/payments/process')
      .send(processPaymentDto)
      .expect(200);

    const paymentId = processResponse.body.paymentId;

    // Then get the payment
    return request(app.getHttpServer())
      .get(`/payments/${paymentId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(paymentId);
        expect(res.body.orderId).toBe(processPaymentDto.orderId);
        expect(res.body.userId).toBe(processPaymentDto.userId);
        expect(res.body.amount).toBe(processPaymentDto.amount);
      });
  });

  it('/payments/:id/status (GET) - should return payment status', async () => {
    // First process a payment
    const processPaymentDto = {
      orderId: 'order202',
      userId: 'user202',
      amount: 50.0,
      authToken: 'dummy_token_user202',
      pin: '1234',
    };

    const processResponse = await request(app.getHttpServer())
      .post('/payments/process')
      .send(processPaymentDto)
      .expect(200);

    const paymentId = processResponse.body.paymentId;

    // Then get the payment status
    return request(app.getHttpServer())
      .get(`/payments/${paymentId}/status`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('paymentId');
        expect(res.body).toHaveProperty('status');
        expect(['success', 'failed']).toContain(res.body.status);
        expect(res.body.paymentId).toBe(paymentId);
      });
  });

  it('/payments/order/:orderId (GET) - should return payments for a specific order', async () => {
    const orderId = 'order303';

    // Process multiple payments for the same order
    const processPaymentDto1 = {
      orderId,
      userId: 'user303',
      amount: 25.0,
      authToken: 'dummy_token_user303',
      pin: '1234',
    };

    const processPaymentDto2 = {
      orderId,
      userId: 'user303',
      amount: 30.0,
      authToken: 'dummy_token_user303',
      pin: '1234',
    };

    await request(app.getHttpServer())
      .post('/payments/process')
      .send(processPaymentDto1)
      .expect(200);

    await request(app.getHttpServer())
      .post('/payments/process')
      .send(processPaymentDto2)
      .expect(200);

    // Get payments for the order
    return request(app.getHttpServer())
      .get(`/payments/order/${orderId}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
        res.body.forEach((payment: any) => {
          expect(payment.orderId).toBe(orderId);
        });
      });
  });

  it('/payments/user/:userId (GET) - should return payments for a specific user', async () => {
    const userId = 'user404';

    // Process multiple payments for the same user
    const processPaymentDto1 = {
      orderId: 'order404a',
      userId,
      amount: 40.0,
      authToken: 'dummy_token_user404',
      pin: '1234',
    };

    const processPaymentDto2 = {
      orderId: 'order404b',
      userId,
      amount: 60.0,
      authToken: 'dummy_token_user404',
      pin: '1234',
    };

    await request(app.getHttpServer())
      .post('/payments/process')
      .send(processPaymentDto1)
      .expect(200);

    await request(app.getHttpServer())
      .post('/payments/process')
      .send(processPaymentDto2)
      .expect(200);

    // Get payments for the user
    return request(app.getHttpServer())
      .get(`/payments/user/${userId}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
        res.body.forEach((payment: any) => {
          expect(payment.userId).toBe(userId);
        });
      });
  });
});
