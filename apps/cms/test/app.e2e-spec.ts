import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CmsModule } from './../src/cms.module';

describe('CmsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CmsModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/admin/programs/health (GET)', () => {
  return request(app.getHttpServer())
    .get('/admin/programs/health') //
    .expect(200)
    .expect((res) => {
      expect(res.body.status).toBe('ok'); 
    });
});
});
