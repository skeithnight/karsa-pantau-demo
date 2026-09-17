import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const logger = new Logger('KarsaBackendApiPod');
  const app = await NestFactory.create(AppModule);

  // S3: Security headers — protects against XSS, clickjacking, MIME sniffing, etc.
  app.use(helmet());

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Whitelist hanya origin produksi yang dikenal — wildcard '*' DILARANG di production
  const allowedOrigins = [
    'https://karsapantau.com',
    'https://app.karsapantau.id',
    ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:3000', 'http://localhost:3001'] : []),
  ];
  app.enableCors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin (mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin '${origin}' tidak diizinkan oleh CORS policy`));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Accept,Authorization,Idempotency-Key,X-Organization-Id',
  });

  // Graceful shutdown handling for Kubernetes SIGTERM signal
  app.enableShutdownHooks();

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`Karsa Pantau Backend API Pod siap berjalan pada port: ${port}`);
}

bootstrap();
