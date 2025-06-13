import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { VercelRequest, VercelResponse } from '@vercel/node';

let app;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!app) {
    app = await NestFactory.create(AppModule);
    await app.init();
  }

  return app.getHttpAdapter().getInstance()(req, res);
}
