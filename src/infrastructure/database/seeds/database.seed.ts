import { Injectable } from '@nestjs/common';
import { UserSeed } from './user.seed';
import { ProductSeed } from './product.seed';

@Injectable()
export class DatabaseSeed {
  constructor(
    private readonly userSeed: UserSeed,
    private readonly productSeed: ProductSeed,
  ) {}

  async run(): Promise<void> {
    console.log('🌱 Starting database seeding...');
    
    try {
      await this.userSeed.run();
      await this.productSeed.run();
      
      console.log('🎉 Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Error during database seeding:', error);
      throw error;
    }
  }
}