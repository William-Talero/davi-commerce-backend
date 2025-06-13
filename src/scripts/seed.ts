import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DatabaseSeed } from '../infrastructure/database/seeds/database.seed';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const seeder = app.get(DatabaseSeed);
  
  try {
    await seeder.run();
    console.log('✨ Seeding process completed!');
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();