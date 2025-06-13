import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './presentation/controllers/auth.controller';
import { UsersController } from './presentation/controllers/users.controller';
import { ProductsController } from './presentation/controllers/products.controller';
import { OrdersController } from './presentation/controllers/orders.controller';
import { LoginUserUseCase } from './domain/use-cases/auth/login-user.use-case';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { ProductRepository } from './infrastructure/repositories/product.repository';
import { OrderRepository } from './infrastructure/repositories/order.repository';
import { PasswordService } from './application/services/password.service';
import { JwtCustomService } from './application/services/jwt.service';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { UserEntity } from './infrastructure/database/entities/user.entity';
import { ProductEntity } from './infrastructure/database/entities/product.entity';
import { OrderEntity } from './infrastructure/database/entities/order.entity';
import { OrderItemEntity } from './infrastructure/database/entities/order-item.entity';
import { INJECTION_TOKENS } from './shared/constants/injection-tokens';
import { UserSeed } from './infrastructure/database/seeds/user.seed';
import { ProductSeed } from './infrastructure/database/seeds/product.seed';
import { DatabaseSeed } from './infrastructure/database/seeds/database.seed';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [UserEntity, ProductEntity, OrderEntity, OrderItemEntity],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      ProductEntity,
      OrderEntity,
      OrderItemEntity,
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AppController,
    AuthController,
    UsersController,
    ProductsController,
    OrdersController,
  ],
  providers: [
    AppService,
    LoginUserUseCase,
    JwtStrategy,
    {
      provide: INJECTION_TOKENS.USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: INJECTION_TOKENS.PRODUCT_REPOSITORY,
      useClass: ProductRepository,
    },
    {
      provide: INJECTION_TOKENS.ORDER_REPOSITORY,
      useClass: OrderRepository,
    },
    {
      provide: INJECTION_TOKENS.PASSWORD_SERVICE,
      useClass: PasswordService,
    },
    {
      provide: INJECTION_TOKENS.JWT_SERVICE,
      useClass: JwtCustomService,
    },
    UserSeed,
    ProductSeed,
    DatabaseSeed,
  ],
})
export class AppModule {}
