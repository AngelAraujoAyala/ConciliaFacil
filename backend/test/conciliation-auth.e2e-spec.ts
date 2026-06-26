import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ReconciliationsController } from './../src/conciliations/reconciliations.controller';
import { ReconciliationsService } from './../src/conciliations/reconciliations.service';
import { SupabaseAuthGuard } from './../src/auth/guards/supabase-auth.guard';
import { PrismaService } from './../src/prisma/prisma.service';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

const USER_A_UUID = 'a1111111-2222-4333-8444-555555555555';
const USER_B_UUID = 'b1111111-2222-4333-8444-555555555555';
const CONCILIATION_UUID = 'c1111111-2222-4333-8444-555555555555';

@Injectable()
class MockSupabaseAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Acceso denegado: Token inválido o ausente');
    }

    if (authHeader === 'Bearer valid-token-user-a') {
      req.user = {
        id: USER_A_UUID,
        email: 'user-a@example.com',
        role: 'authenticated',
      };
      return true;
    }

    if (authHeader === 'Bearer valid-token-user-b') {
      req.user = {
        id: USER_B_UUID,
        email: 'user-b@example.com',
        role: 'authenticated',
      };
      return true;
    }

    throw new UnauthorizedException('Acceso denegado: Token inválido o ausente');
  }
}

const mockPrismaService = {
  user: {
    upsert: jest.fn().mockImplementation(({ create }) => Promise.resolve(create)),
  },
  conciliation: {
    create: jest.fn().mockResolvedValue({ id: CONCILIATION_UUID, title: 'Conciliación Test', userId: USER_A_UUID }),
    findMany: jest.fn().mockResolvedValue([]),
    findFirst: jest.fn().mockResolvedValue({ id: CONCILIATION_UUID, title: 'Conciliación Test', userId: USER_A_UUID }),
  },
};

describe('Reconciliations Security (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ReconciliationsController],
      providers: [
        ReconciliationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useClass(MockSupabaseAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const validPayload = {
    title: 'Auditoría Mensual',
    userId: USER_A_UUID,
    successRate: 95,
    totalInvoices: 10,
    totalBankMovements: 12,
    matchedCount: 9,
    matches: [{ id: 'match-1' }], // Debe tener elementos para cumplir con @IsNotEmpty()
    remainingInvoices: [],
    remainingBankMovements: [],
  };

  describe('1. Peticiones sin token (Debe retornar 401)', () => {
    it('POST /api/reconciliations sin cabecera Authorization', () => {
      return request(app.getHttpServer())
        .post('/api/reconciliations')
        .send(validPayload)
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Token inválido o ausente');
        });
    });

    it('GET /api/reconciliations sin cabecera Authorization', () => {
      return request(app.getHttpServer())
        .get(`/api/reconciliations?userId=${USER_A_UUID}`)
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Token inválido o ausente');
        });
    });
  });

  describe('2. Peticiones con token inválido/manipulado (Debe retornar 401)', () => {
    it('POST /api/reconciliations con token falso', () => {
      return request(app.getHttpServer())
        .post('/api/reconciliations')
        .set('Authorization', 'Bearer token-manipulado-o-falso')
        .send(validPayload)
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Token inválido o ausente');
        });
    });

    it('GET /api/reconciliations con token falso', () => {
      return request(app.getHttpServer())
        .get(`/api/reconciliations?userId=${USER_A_UUID}`)
        .set('Authorization', 'Bearer token-manipulado-o-falso')
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Token inválido o ausente');
        });
    });
  });

  describe('3. Validación Multi-tenant y Bloqueo (Debe retornar 403 o permitir según corresponda)', () => {
    it('POST /api/reconciliations: Permitir si el token de Usuario A coincide con userId del payload', () => {
      return request(app.getHttpServer())
        .post('/api/reconciliations')
        .set('Authorization', 'Bearer valid-token-user-a')
        .send({ ...validPayload, userId: USER_A_UUID })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });

    it('POST /api/reconciliations: Denegar (403) si el token de Usuario A intenta guardar para Usuario B', () => {
      return request(app.getHttpServer())
        .post('/api/reconciliations')
        .set('Authorization', 'Bearer valid-token-user-a')
        .send({ ...validPayload, userId: USER_B_UUID })
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toContain('No tienes permiso para guardar una conciliación para otro usuario.');
        });
    });

    it('GET /api/reconciliations: Permitir si el token de Usuario A coincide con el userId query param', () => {
      return request(app.getHttpServer())
        .get(`/api/reconciliations?userId=${USER_A_UUID}`)
        .set('Authorization', 'Bearer valid-token-user-a')
        .expect(200);
    });

    it('GET /api/reconciliations: Denegar (403) si el token de Usuario A intenta leer el historial de Usuario B', () => {
      return request(app.getHttpServer())
        .get(`/api/reconciliations?userId=${USER_B_UUID}`)
        .set('Authorization', 'Bearer valid-token-user-a')
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toContain('No tienes permiso para acceder al historial de conciliaciones de otro usuario.');
        });
    });

    it('GET /api/reconciliations/:id: Denegar (403) si el token de Usuario A intenta leer detalle con userId de Usuario B', () => {
      return request(app.getHttpServer())
        .get(`/api/reconciliations/${CONCILIATION_UUID}?userId=${USER_B_UUID}`)
        .set('Authorization', 'Bearer valid-token-user-a')
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toContain('No tienes permiso para acceder al detalle de esta conciliación.');
        });
    });
  });
});
