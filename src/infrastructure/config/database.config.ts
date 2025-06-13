import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserEntity } from '../database/entities/user.entity';
import { ProductEntity } from '../database/entities/product.entity';

console.log('Database configuration loaded from environment variables');
console.log(`Database URL: ${process.env.DATABASE_URL}`);

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [UserEntity, ProductEntity],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
};
