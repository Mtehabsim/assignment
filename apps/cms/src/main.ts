import { NestFactory, Reflector } from "@nestjs/core";
import {
  ValidationPipe,
  Logger,
  ClassSerializerInterceptor,
} from "@nestjs/common";
import { CmsModule } from "./cms.module";
import helmet from "helmet";

async function bootstrap() {
  const logger = new Logger("CMS");
  const app = await NestFactory.create(CmsModule);

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

  const port = process.env.CMS_PORT ?? 3001;
  await app.listen(port, "0.0.0.0");

  logger.log(`CMS API running on http://localhost:${port}`);
}
bootstrap();
