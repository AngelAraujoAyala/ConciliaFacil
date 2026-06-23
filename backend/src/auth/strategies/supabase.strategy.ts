import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa'; // Importamos el resolvedor de claves JWKS

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  constructor(private configService: ConfigService) {
    const supabaseUrl = configService.get<string>('VITE_SUPABASE_URL');
    // Nota: Si no tienes VITE_SUPABASE_URL en el backend, puedes usar tu URL directa:
    // https://xthqrvpezlrlqpojmpmd.supabase.co

    super({
      // 1. Extraer el token del header Bearer
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,

      // 2. Definir explícitamente el algoritmo que viene en tu log: ES256
      algorithms: ['ES256'],

      // 3. Obtener la clave pública dinámicamente desde el endpoint de auth de tu Supabase
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${supabaseUrl || 'https://xthqrvpezlrlqpojmpmd.supabase.co'}/auth/v1/.well-known/jwks.json`,
      }),
    });

    console.log('🔑 SupabaseStrategy inicializada con algoritmo ES256 y JWKS.');
  }

  async validate(payload: any) {
    // Si el algoritmo hace match, Passport desencriptará esto con la clave pública
    console.log('👤 [ÉXITO] Payload decodificado del JWT:', payload);

    if (payload.role !== 'authenticated') {
      throw new UnauthorizedException('Rol de usuario no autorizado');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
