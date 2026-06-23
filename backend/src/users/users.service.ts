import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(id: string, email: string) {
    // 1. Intentamos buscar al usuario
    let user = await this.prisma.user.findUnique({
      where: { id },
      include: {
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
          // Aquí puedes mapear campos por defecto que requiera tu modelo:
          // isSubscribed: false,
          // freeConciliationsLeft: 5,
        },
        include: {
          _count: {
            select: { conciliations: true },
          },
        },
      });
    }

    return user;
  }
}
