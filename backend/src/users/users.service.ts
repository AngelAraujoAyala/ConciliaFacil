import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(id: string, email: string) {
    // 1. Intentamos buscar al usuario (incluyendo plan y empresas registradas)
    let user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        empresas: {
          select: {
            id: true,
            rfc: true,
            razonSocial: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: { conciliations: true },
        },
      },
    });

    // 2. Si no existe (Target 404), lo creamos On-The-Fly para rescatar el flujo
    if (!user) {
      console.log(
        `⚠️ Usuario ${email} no encontrado en tabla pública. Creando registro dinámico...`,
      );

      user = await this.prisma.user.create({
        data: {
          id, // Usamos el mismo UUID exacto de Supabase Auth
          email,
          // plan se asigna FREE por defecto desde Prisma schema
        },
        include: {
          empresas: {
            select: {
              id: true,
              rfc: true,
              razonSocial: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
          },
          _count: {
            select: { conciliations: true },
          },
        },
      });
    }

    return user;
  }
}
