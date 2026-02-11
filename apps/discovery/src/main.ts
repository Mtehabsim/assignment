import { NestFactory, Reflector } from "@nestjs/core";
import {
  ValidationPipe,
  Logger,
  ClassSerializerInterceptor,
} from "@nestjs/common";
import { DiscoveryModule } from "./discovery.module";
import helmet from "helmet";

async function bootstrap() {
  const logger = new Logger("Discovery");
  const app = await NestFactory.create(DiscoveryModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Security headers
  app.use(helmet());

  app.enableCors();

  const port = process.env.DISCOVERY_PORT ?? 3002;
  await app.listen(port, "0.0.0.0");

  logger.log(`Discovery API running on http://localhost:${port}`);
}
bootstrap();
