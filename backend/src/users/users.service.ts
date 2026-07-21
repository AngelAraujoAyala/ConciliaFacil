import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { AppTheme, type UserPreferences } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';
import {
  DEFAULT_USER_PREFERENCES,
  type UserPreferencesResponse,
} from './user-preferences.constants';

/** Calcula el primer día del mes siguiente a `from` en UTC. */
function calcularProximoReset(from: Date = new Date()): Date {
  const d = new Date(Date.UTC(
    from.getUTCFullYear(),
    from.getUTCMonth() + 1, // primer día del mes siguiente
    1,
    0, 0, 0, 0,
  ));
  return d;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getProfile(id: string, email: string) {
    const includeOpts = {
      empresas: {
        select: {
          id: true,
          rfc: true,
          razonSocial: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' as const },
      },
      _count: {
        select: { conciliations: true },
      },
    };

    // 1. Buscar al usuario (incluyendo plan y empresas registradas)
    let user = await this.prisma.user.findUnique({
      where: { id },
      include: includeOpts,
    });

    // 2. Si no existe, lo creamos On-The-Fly asignando nextResetDate correcto
    if (!user) {
      console.log(
        `⚠️ Usuario ${email} no encontrado en tabla pública. Creando registro dinámico...`,
      );

      // nextResetDate = primer día del mes siguiente en UTC.
      // Sin esto el campo hereda @default(now()) del schema, que queda en el
      // pasado de inmediato y el dashboard muestra "se reiniciará hoy" siempre.
      const nextResetDate = calcularProximoReset();

      user = await this.prisma.user.create({
        data: {
          id,      // UUID exacto de Supabase Auth
          email,
          nextResetDate,
          // plan: FREE por defecto (definido en el schema)
        },
        include: includeOpts,
      });
    }

    // 3. Lazy-reset: si ya pasó la fecha de reinicio, actualizar la BD ahora.
    // Esto garantiza que /users/me siempre devuelva datos frescos aunque el
    // usuario no haya creado ninguna conciliación en el período.
    const now = new Date();
    if (now >= user.nextResetDate) {
      const nextReset = new Date(user.nextResetDate);
      // Avanzar un mes a la vez hasta superar `now` (cubre ausencias largas)
      while (now >= nextReset) {
        nextReset.setUTCMonth(nextReset.getUTCMonth() + 1);
      }

      user = await this.prisma.user.update({
        where: { id },
        data: {
          monthlyConciliations: 0,
          monthlyRfcs: 0,
          nextResetDate: nextReset,
        },
        include: includeOpts,
      });

      console.log(
        `🔄 Lazy-reset aplicado al usuario ${email}: nextResetDate → ${nextReset.toISOString()}`,
      );
    }

    return user;
  }

  async deleteAccount(userId: string): Promise<void> {
    // 1. Borrar el registro en nuestra BD (cascade elimina conciliaciones, empresas, preferencias)
    await this.prisma.user.delete({ where: { id: userId } });

    // 2. Borrar el usuario de Supabase Auth usando el service_role key
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL')!;
    const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!;

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) {
      console.error(`⚠️ Error al eliminar usuario ${userId} de Supabase Auth:`, error.message);
      // No lanzamos excepción: el usuario ya no existe en nuestra BD.
      // Supabase Auth lo limpiará eventualmente o quedará huérfano inofensivo.
    }
  }

  async getPreferences(
    userId: string,
    email: string,
  ): Promise<UserPreferencesResponse> {
    await this.getProfile(userId, email);

    const preferences = await this.ensureUserPreferences(userId);
    return this.toPreferencesResponse(preferences);
  }

  async updatePreferences(
    userId: string,
    email: string,
    dto: UpdateUserPreferencesDto,
  ): Promise<UserPreferencesResponse> {
    await this.getProfile(userId, email);

    const preferences = await this.prisma.userPreferences.upsert({
      where: { userId },
      create: {
        userId,
        theme: dto.theme ?? AppTheme.light,
      },
      update: {
        ...(dto.theme !== undefined ? { theme: dto.theme } : {}),
      },
    });

    return this.toPreferencesResponse(preferences);
  }

  private async ensureUserPreferences(
    userId: string,
  ): Promise<UserPreferences> {
    const existing = await this.prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (existing) return existing;

    return this.prisma.userPreferences.create({
      data: {
        userId,
        theme: AppTheme.light,
      },
    });
  }

  private toPreferencesResponse(
    preferences: UserPreferences,
  ): UserPreferencesResponse {
    return {
      theme: preferences.theme,
    };
  }
}
