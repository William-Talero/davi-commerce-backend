import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@davicommerce.com',
        password: 'Admin123!',
      });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/products (GET)', () => {
    it('should return array of products', () => {
      return request(app.getHttpServer())
        .get('/api/products')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('price');
        });
    });
  });

  describe('/products/:id (GET)', () => {
    it('should return product by id', async () => {
      // First get a product to have a valid ID
      const productsResponse = await request(app.getHttpServer())
        .get('/api/products');
      
      const productId = productsResponse.body[0].id;

      return request(app.getHttpServer())
        .get(`/api/products/${productId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', productId);
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('price');
        });
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .get('/api/products/999999')
        .expect(404);
    });
  });

  describe('/products (POST)', () => {
    it('should create product with admin token', () => {
      const newProduct = {
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        stock: 10,
        category: 'electronics',
        imageUrl: 'https://example.com/image.jpg',
      };

      return request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newProduct)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', newProduct.name);
          expect(res.body).toHaveProperty('price', newProduct.price);
        });
    });

    it('should return 401 without auth token', () => {
      const newProduct = {
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        stock: 10,
        category: 'electronics',
        imageUrl: 'https://example.com/image.jpg',
      };

      return request(app.getHttpServer())
        .post('/api/products')
        .send(newProduct)
        .expect(401);
    });
  });
});